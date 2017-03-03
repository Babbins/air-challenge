import React, {Component} from 'react';
import {Well, Row, Col, Image} from 'react-bootstrap';
import './video.css';
import {formatDate} from '../utils.js';

export default class Video extends Component {
  constructor(props){
    super(props);
    this.state = {
      clicked: false
    };
  }

  render() {
    const {video, num, activeSort} = this.props;
    return (
        <Row className="clearfix">
          <Col xs={12} className='col-centered'>
            <Well>
              <span className='grey number text-sm'>#{num+1}</span>

              { this.state.clicked || !video.embed.thumbnail_url_with_play_button ?
                <div
                  className='embed-container'
                  dangerouslySetInnerHTML={{__html: video.embed.html}}
                />
                : (<div>
                    <p className="grey text-lg">{video.name}</p>
                    <Image
                      className='responsive-image'
                      onClick={() => this.setState({clicked: true})}
                      src={video.embed.thumbnail_url_with_play_button}
                    />
                  </div>)
                }

              <p className="text-left text-md">
                <span className={activeSort === 'likes' ? '' : 'grey'}>
                  {video.metadata.connections.likes.total} likes
                </span>
                |
                <span className={activeSort === 'date' ? '' : 'grey'}>
                  {formatDate(video.release_time)}
                </span>
              </p>
            </Well>
          </Col>
        </Row>
    );
  }

}
