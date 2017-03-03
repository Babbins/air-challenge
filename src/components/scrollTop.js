import React, {Component} from 'react';
import {Button, Glyphicon} from 'react-bootstrap';
import $ from 'jquery';

import './scrollTop.css';
export default class scrollTop extends Component {
  scrollToTop() {
    $('body, html').animate({scrollTop: 0}, 200);
  }
  render() {
    return (
      <Button className='scrollTop' onClick={this.scrollToTop}> <Glyphicon glyph="arrow-up"/> </Button>
    )
  }
}
