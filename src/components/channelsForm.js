import React, { Component } from 'react';
import {Well, Row, Col, FormGroup, FormControl, Button, ButtonGroup, Glyphicon} from 'react-bootstrap';
export default class channelsForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      inputs: ['262204','ladieswithlenses','vimeo.com/channels/musicbed'],
      hitChannelLimit: false,
    };
    this.addInput = this.addInput.bind(this);
    this.clearInputs = this.clearInputs.bind(this);
  }

  addInput() {
    const inputs = [...this.state.inputs, ''];
    if (inputs.length === 5) {
      this.setState({inputs, hitChannelLimit: true});
    } else {
      this.setState({inputs});
    }
  }

  handleInputChange(idx, evt) {
    const inputs = [...this.state.inputs];
    inputs[idx] = evt.target.value;
    this.setState({inputs});
  }

  removeInput(idx) {
    const inputs = [...this.state.inputs];
    inputs.splice(idx, 1);
    if (inputs.length === 4) {
      this.setState({ inputs, hitChannelLimit: false });
    } else {
      this.setState({inputs});
    }
  }

  clearInputs() {
    this.setState({
      inputs: this.state.inputs.map(() => '')
    })
  }
  render() {
    const {inputs, hitChannelLimit} = this.state;
    const {search} = this.props;
    return (
        <Well>
          <h3>Add Channels</h3>
          <form onSubmit={(evt) => search(inputs.filter(i => i !== ''), evt)}>
            <FormGroup>
              {inputs.map((input, idx) => (
                <Row key={idx}>
                  <Col xs={8} xsOffset={1}>
                    <FormControl tabIndex={idx + 1} onChange={(evt) => this.handleInputChange(idx, evt)} type="text" value={input} placeholder="Channel name OR id" />
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
                  <Button type='submit'> <Glyphicon glyph="search" /> Search </Button>
                </Col>
              </Row>
             </FormGroup>
           </form>
         </Well>

    );
  }
}
