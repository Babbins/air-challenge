import React, { Component } from 'react';
import {Panel, Row, Col, FormGroup, FormControl, Button, Glyphicon} from 'react-bootstrap';

export default class Video extends Component {
  render() {
    const {video, num} = this.props;
    return (
        <Row className="clearfix">
          <Col xs={12} className='col-centered'>
            <Panel>
              <h3>#{num+1}</h3>
              <h3> {video.name} </h3>
              <div dangerouslySetInnerHTML={{ __html: video.embed.html }} />
              <h3>{video.metadata.connections.likes.total} likes</h3>
              <h3>{video.release_time} likes</h3>
            </Panel>
          </Col>
        </Row>
    );
  }
}
