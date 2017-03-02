import React, { Component } from 'react';
import {Fade, Panel, Row, Col, FormGroup, FormControl, Button, ButtonGroup, Glyphicon} from 'react-bootstrap';
export default class channelsForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      inputs: [{channel: '241'}, {channel: '240'}, {channel: '313'}, {channel: '5000'}],
      hitChannelLimit: false,
    };
    this.addInput = this.addInput.bind(this);
    this.clearInputs = this.clearInputs.bind(this);
  }

  addInput() {
    this.setState(prevState => {
      const inputs = [...prevState.inputs, {channel: ''}];
      if (inputs.length === 5) {
        return {inputs, hitChannelLimit: true};
      } else {
        return { inputs };
      }
    });
  }

  handleInputChange(idx, evt) {
    evt.persist();
    this.setState(prevState => {
      const inputs = [...prevState.inputs];
      inputs[idx].channel = evt.target.value;
      return { inputs };
    })
  }

  removeInput(idx) {
    this.setState(prevState => {
      const inputs = [...prevState.inputs];
      inputs.splice(idx, 1);
      if (inputs.length === 4) {
        return { inputs, hitChannelLimit: false };
      } else {
        return { inputs };
      }

    })
  }

  clearInputs() {
    this.setState(prevState => {
      const inputs = prevState.inputs.map(input => { return {channel: ''} })
      return { inputs }
    })
  }
  render() {
    const {inputs, hitChannelLimit} = this.state;
    const {search} = this.props;
    return (
        <Panel>
          <h3 className="plum">Add Channels</h3>
          <FormGroup>
            {inputs.map((input, idx) => (
              <Row key={idx}>
                <Col xs={8} xsOffset={1}>
                  <FormControl tabIndex ={idx+1} onChange={(evt) => this.handleInputChange(idx, evt)} type="text" value={input.channel} placeholder="Channel name OR id" />
                </Col>
                <Col xs={1}>
                  <Button onClick={() => this.removeInput(idx)}><Glyphicon glyph="remove" /> </Button>
                </Col>
              </Row>
            ))}
            <Row>
              <Col xs={8} xsOffset={1}>
                <ButtonGroup>
                    <Button disabled={hitChannelLimit} onClick={this.addInput}> <Glyphicon glyph="plus"/> Add Channel </Button>
                    <Button onClick={this.clearInputs} > <Glyphicon glyph="erase" /> Clear All</Button>
                </ButtonGroup>
              </Col>
            </Row>
            <Row className="mt-2">
              <Col xs={4}>
                <Button onClick={() => search(inputs)}> <Glyphicon glyph="search" /> Search </Button>
              </Col>
            </Row>
           </FormGroup>
         </Panel>

    );
  }
}
