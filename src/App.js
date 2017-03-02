import React, { Component } from 'react';
import $ from 'jquery';
import './style.css';
import {throttle} from 'lodash';
import {Grid, Button, Glyphicon, Dropdown} from 'react-bootstrap';
import {stringify} from 'query-string';
import ChannelsForm from './components/channelsForm';
import Video from './components/video';
import Loader from './components/loader';
import Navbar from './components/navbar';
import ScrollTop from './components/scrollTop';
import Sort from './components/sort';
const headers = {
    'Authorization': 'Bearer 2ccddd9037c0c48e18a63fab95be26cb',
    'Content-Type': 'application/json'
}


class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      channels: [],
      videos: [],
      visibleVideos: [],
      searchedInputs: [],
      sortBy: 'likes',
      hasMoreVideosToLoad: false,
      isLoading: false
    };
    this.search = this.search.bind(this);
    this.sort = this.sort.bind(this);
    this.handleInfiniteLoad = this.handleInfiniteLoad.bind(this);
    this.morePages = this.morePages.bind(this);
    this.fetchMoreVideos = this.fetchMoreVideos.bind(this);
    this.checkForMoreVideos = this.checkForMoreVideos.bind(this);
  }

  getQueryString() {
    return stringify({
    page: 1,
    per_page: 12,
    filter: 'embeddable',
    filter_embeddable: true,
    sort: this.state.sortBy,
    fields: 'name, metadata.connections.likes,release_time,link, embed'
    });
  }
  componentDidMount(){
    $(window).on('scroll', throttle(() => {
      if (!this.state.visibleVideos || this.state.isLoading || !this.state.hasMoreVideosToLoad) return;
      if ($(window).scrollTop() === $(document).height() - $(window).height()) {
          this.handleInfiniteLoad();
      }
    }, 200));
  }

  sort(val, shouldFetch) {

    if (shouldFetch && this.state.sortBy !== val) {
      this.setState({sortBy: val},
      () => this.search(this.state.searchedInputs));
    } else {
      const videos = this.state.videos.sort(sortByFunc(val));
      const visibleVideos = videos.slice(0, 12);
      this.setState({videos, visibleVideos});
    }
  }

  search(inputs) {
    this.setState({
      searchedInputs: inputs,
      isLoading: true,
      visibleVideos: [],
      videos: []
    });
    const channelVideoPromises = [];
    // const channelIdRegExp = /^\d+$/;
    inputs
      .map(input => input.channel)
      .forEach(channel => {
        // if (channelIdRegExp.test(channel)) {
          console.log(this.getQueryString())
          let channelPromise = fetch(`https://api.vimeo.com/channels/${channel}/videos?${this.getQueryString()}`, {
            headers
          });
          channelVideoPromises.push(channelPromise);
        // }
      })
      Promise.all(channelVideoPromises)
        .then(responses => Promise.all(responses.map(res => res.json())))
        .then(channels => {
          console.log(channels);
          this.setState({channels});
          const videos = [];
          channels.forEach(channel => {
            videos.push(...channel.data);
          });
          return getEmbedsForVideos(videos)
        })
        .then(videos => {
          videos = videos.sort(sortByFunc(this.state.sortBy))
          this.setState({
            videos,
            visibleVideos: videos.slice(0, 12),
            isLoading: false
          });
          if (videos.length > 12 || this.morePages()) {
            this.setState({hasMoreVideosToLoad: true});
          }
        })
  }


  fetchMoreVideos() {
    const channelPromises = [];
    this.state.channels.forEach(channel => {
      if (channel.paging.next) {
        const channelPromise = fetch(`https://api.vimeo.com${channel.paging.next}`, {headers});
        channelPromises.push(channelPromise);
      }
    });
    return Promise.all(channelPromises)
      .then(responses => Promise.all(responses.map(res => res.json())))
      .then(channels => {
        console.log('channels', channels)
        this.setState({channels});
        const videos = [];
        channels.forEach(channel => {
          videos.push(...channel.data);
        });
        return getEmbedsForVideos(videos)
      })
  }

  handleInfiniteLoad() {
    this.setState({isLoading: true})
    const {videos, visibleVideos} = this.state;
    const visibleVideoCount = visibleVideos.length;
    if (this.morePages()) {
      console.log('fetching videos!')
      this.fetchMoreVideos()
        .then(newVideos => {
          console.log('videos fetched!');
          videos.push(...newVideos);
          console.log('SORTING!');
          videos.sort(sortByFunc(this.state.sortBy));
          console.log('DONE SORTING!');
          visibleVideos.push(...videos.slice(visibleVideoCount, visibleVideoCount + 12 ));
          this.setState({
            videos,
            visibleVideos,
            isLoading: false
          }, this.checkForMoreVideos)
        })
    } else {
        visibleVideos.push(...videos.slice(visibleVideoCount, visibleVideoCount + 12 ));
        this.setState({
          videos,
          visibleVideos,
          isLoading: false
        }, this.checkForMoreVideos)
    }
  }

  //sets 'hasMoreVideosToLoad' to false if we rendered all videos and there are no more pages to query.
  checkForMoreVideos() {
    console.log('checking');
    const {videos, visibleVideos} = this.state;
    if ((videos.length === visibleVideos.length) && !this.morePages()) {
      console.log('set hasMore to false');
      this.setState({hasMoreVideosToLoad: false});
    }
  }
  morePages() {
    return this.state.channels.some(channel => !!channel.paging.next);
  }


  render() {
    const {visibleVideos, hasMoreVideosToLoad, isLoading, sortBy} = this.state;
    console.log(visibleVideos.length, this.state.videos.length);
    console.log(this.state);
    return (
      <div className="App">
        <Navbar />
        <Grid>
          <ChannelsForm search={this.search}/>
          <Sort sortBy={sortBy} sort={this.sort}/>
            {visibleVideos.map((video, idx) => (
              <Video key={idx} num={idx} video={video} />
            ))}
            {isLoading && <Loader />}
        </Grid>
        <ScrollTop />
      </div>
    );
  }
}

const getEmbedsForVideos = (videos) => {
  const oEmbedEndpoint = 'https://vimeo.com/api/oembed.json';
  const embedPromises = [];
  videos.forEach(video => {
    let embedPromise = fetch(`${oEmbedEndpoint}?url=${video.link}`)
      .then(res => res.json())
      .catch(() => video.embed)
    embedPromises.push(embedPromise);
  });
  return Promise.all(embedPromises)
    .then(embeds => {
      return videos.map((video, idx) => {
        video.embed = embeds[idx];
        return video;
      });
    });
}
const sortByFunc = (val) => {
  if (val === 'likes') {
    return (a, b) => {
      return b.metadata.connections.likes.total - a.metadata.connections.likes.total;
    }
  } else if (val === 'date') {
    return (a, b) => {
      return Date.parse(b.release_time) - Date.parse(a.release_time);
    }
  }
}

export default App;
