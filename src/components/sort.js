import React from 'react';
import {Glyphicon} from 'react-bootstrap';

export default (props) => (
  <h3>
    Sort:
    <span
      id='sort'
      className={props.sortBy === 'likes' ? 'white' : ''}
      onClick={() => props.sort('likes', true)} >
      <Glyphicon glyph='heart'/> Likes
    </span>
  | <span
      id='sort'
      className={props.sortBy === 'date' ? 'white' : ''}
      onClick={() => props.sort('date', true)} >
      <Glyphicon glyph='time'/> Date
    </span>
  </h3>
);
