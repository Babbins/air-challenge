import React, {Component} from 'react';
import $ from 'jquery';
import {Grid} from 'react-bootstrap';

 //Library Function to turn JSON string to query string
import {stringify} from 'query-string';
import './style.css';

import ChannelsForm from './components/channelsForm';
import Video from './components/video';
import Loader from './components/loader';
import Navbar from './components/navbar';
import ScrollTop from './components/scrollTop';
import Sort from './components/sort';

const headers = {
    'Authorization': `Bearer 2ccddd9037c0c48e18a63fab95be26cb`,
    'Content-Type': 'application/json'
}

const generateEndpoints = (channels) => {
  const urlRegEx = /^(https?:\/\/)?(www\.)?vimeo.com\/channels\/.+$/;
  return channels.map(channel => {
    if (urlRegEx.test(channel)) {
      channel = channel.split('/').slice(-1);
    }
    return `https://api.vimeo.com/channels/${channel}/videos`;
  })
}

const getEmbedsForVideos = (videos) => {
  const oEmbedEndpoint = 'https://vimeo.com/api/oembed.json';
  const embedPromises = [];
  videos.forEach(video => {
    let embedPromise = fetch(`${oEmbedEndpoint}?url=${video.link}`)
      .then(res => res.json())
      .catch(() => video.embed);
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

const getVideosFromChannels = (channels) => {
  const videos = [];
  channels.forEach(channel => {
    videos.push(...channel.data);
  })
  return getEmbedsForVideos(videos);
}

export default class App extends Component {

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
    this.fetchNextPage = this.fetchNextPage.bind(this);
  }

  componentDidMount(){
    //Scroll Event Handler to run infinite load when user scrolls to the bottom of the page
    $(window).on('scroll', () => {
      if (!this.state.visibleVideos || this.state.isLoading || !this.state.hasMoreVideosToLoad) return;
      if ($(window).scrollTop() >= $(document).height() - $(window).height()) {
          this.handleInfiniteLoad();
      }
    });
  }

  getQueryString() {
    return stringify({
      page: this.state.page,
      per_page: 12,
      filter: 'embeddable',
      filter_embeddable: true,
      sort: this.state.sortBy,
      fields: 'name, metadata.connections.likes, release_time, embed, link'
    });
  }

  search(inputs, evt) {
    if (evt) evt.preventDefault();
    this.setState({
      searchedInputs: inputs,
      isLoading: true,
      visibleVideos: []
    });
    const channelPromises = [];
    generateEndpoints(inputs).forEach(endpoint => {
      const channelPromise = fetch(`${endpoint}?${this.getQueryString()}`, {headers});
      channelPromises.push(channelPromise);
    })
    Promise.all(channelPromises)
      .then(responses => Promise.all(responses.map(r => r.json())))
      .then(channels => {
        this.setState({channels});
        return getVideosFromChannels(channels);
      })
      .then(videos => {
          this.setState({
            videos: videos.sort(this.getSortByFunc()),
            visibleVideos: videos.slice(0, 12),
            isLoading: false,
            hasMoreVideosToLoad: true
          });
      })

  }

  fetchNextPage() {
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
        this.setState({channels});
        return channels;
      })
  }

  handleInfiniteLoad() {
    this.setState({isLoading: true});
    let {videos, visibleVideos} = this.state;
    const visibleVideoCount = visibleVideos.length;
    if (this.morePages()) {
      this.fetchNextPage()
        .then(getVideosFromChannels)
        .then(newVideos => {
          videos = videos.concat(newVideos);
          videos.sort(this.getSortByFunc());
          const videosToRender = videos.slice(visibleVideoCount, visibleVideoCount + 12 );
          this.setState({
            videos,
            visibleVideos: visibleVideos.concat(videosToRender),
            isLoading: false
          })
        })
    } else if (visibleVideos.length < videos.length){
        const videosToRender = videos.slice(visibleVideoCount, visibleVideoCount + 12 );
        this.setState({
          videos,
          visibleVideos: visibleVideos.concat(videosToRender),
          isLoading: false
        });
    } else {
      this.setState({isLoading: false, hasMoreVideosToLoad: false});
    }
  }

  getSortByFunc() {
    if (this.state.sortBy === 'likes') {
      return (a, b) => {
        return b.metadata.connections.likes.total - a.metadata.connections.likes.total;
      }
    } else if (this.state.sortBy === 'date') {
      return (a, b) => {
        return Date.parse(b.release_time) - Date.parse(a.release_time);
      }
    }
  }

  sort(val, shouldFetch) {
    if (shouldFetch && this.state.sortBy !== val) {
      this.setState({sortBy: val},
      () => this.search(this.state.searchedInputs));
    } else {
      const videos = this.state.videos.sort(this.getSortByFunc());
      const visibleVideos = videos.slice(0, 12);
      this.setState({videos, visibleVideos});
    }
  }

  morePages() {
    return this.state.channels.some(channel => !!channel.paging.next);
  }

  render() {
    const {visibleVideos, isLoading, sortBy} = this.state;
    console.log(visibleVideos.length, this.state.videos.length)
    return (
      <div className="App">
        <Navbar />
        <Grid>
          <ChannelsForm search={this.search}/>
          <Sort sortBy={sortBy} sort={this.sort}/>

          {visibleVideos.map((video, idx) => (
            <Video key={idx} num={idx} video={video} activeSort={sortBy} />
          ))}

          <Loader show={isLoading} />
        </Grid>
        <ScrollTop />
      </div>
    );
  }
}
