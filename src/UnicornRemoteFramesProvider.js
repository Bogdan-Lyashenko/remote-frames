import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { render } from 'react-dom'
import GlobalTarget from './GlobalTarget'

class UnicornRemoteFramesProvider extends Component {
  constructor(props) {
    super(props)

    this.queue = []

    this.state = {
      renderInRemote: renderInformation => this.queue.push(['render', renderInformation]),
      removeFromRemote: jsx => this.queue.push(['remove', jsx]),
    }
  }

  componentDidMount() {
    if (this.props.targetDomElement instanceof HTMLElement) {
      this.renderGlobalTarget(this.props.targetDomElement)
    } else {
      this.props.targetDomElement.then(this.renderGlobalTarget.bind(this))
    }
  }

  renderGlobalTarget(targetDomElement) {
    render(
      <GlobalTarget
        onAddStackElement={this.props.onFrameAdded}
        onEmptyStack={this.props.onNoFrames}
        onReady={this.handleOnReady.bind(this)}
      />,
      targetDomElement
    )
  }

  handleOnReady(renderInRemote, removeFromRemote) {
    this.setState(
      {
        renderInRemote,
        removeFromRemote,
      },
      () => {
        this.queue.forEach(([type, renderInformation]) => {
          if (type === 'render') {
            renderInRemote(renderInformation)
          } else {
            removeFromRemote(renderInformation)
          }
        })

        delete this.queue
      }
    )
  }

  getChildContext() {
    return {
      renderInRemote: this.state.renderInRemote,
      removeFromRemote: this.state.removeFromRemote,
    }
  }

  render() {
    return this.props.children
  }
}

UnicornRemoteFramesProvider.childContextTypes = {
  renderInRemote: PropTypes.func,
  removeFromRemote: PropTypes.func,
}

export default UnicornRemoteFramesProvider
