import React, {Component} from 'react';
import {Button, Glyphicon} from 'react-bootstrap';
import $ from 'jquery';

export default class scrollTop extends Component {
  scrollToTop() {
    $('body, html').scrollTop(0);
  }
  render() {
    return (
      <Button className='scrollTop' onClick={this.scrollToTop}> <Glyphicon glyph="arrow-up"/> </Button>
    )
  }
}
