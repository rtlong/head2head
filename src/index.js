import React from 'react'

var ScoreBox = React.createClass({
  displayName: 'ScoreBox',
  render: function () {
    return React.createElement('div', { className: 'score' + (this.props.win ? ' winner' : '') }, this.props.score)
  },
})

var ScoreBoard = React.createClass({
  displayName: 'ScoreBoard',
  getInitialState: function () {
    return {
      leftScore: 0,
      rightScore: 0,
      winner: null,
    }
  },

  render: function () {
    return React.createElement(
      'div', { className: 'scoreBoard' },
      React.createElement(ScoreBox, {
        score: this.state.leftScore,
        win: (this.state.winner == 'left') }),
      React.createElement(ScoreBox, {
        score: this.state.rightScore,
        win: (this.state.winner == 'right') })
    )
  },

  setScore: function (side, d) {
    var key = side + 'Score'
    var newScore = this.state[key] + d
    if (newScore < 0) { newScore = 0 }
    console.log(side + ' scored', newScore)
    var scores = {
      leftScore: this.state.leftScore,
      rightScore: this.state.rightScore,
      winner: null,
    }
    scores[key] = newScore

    if (scores.leftScore >= 11 && scores.leftScore - scores.rightScore >= 2) {
      scores.winner = 'left'
    } else if (scores.rightScore >= 11 && scores.rightScore - scores.leftScore >= 2) {
      scores.winner = 'right'
    }
    this.setState(scores)
  },

  scoreLeft: function (d=1) {
    this.setScore('left', d)
  },

  scoreRight: function (d=1) {
    this.setScore('right', d)
  },

  reset: function () {
    this.setState(this.getInitialState())
  },
})

var scoreboard = React.render(React.createElement(ScoreBoard, null), document.getElementById('content'))
window.scoreboard = scoreboard

var keys = {
  0: 48,
  1: 49,
  2: 50,
}

document.addEventListener('keydown', (e) => {
  if (e.repeat) { return }
  switch (e.keyCode) {
    case keys[0]: {
      scoreboard.reset()
      break
    }
    case keys[1]: {
      scoreboard.scoreLeft(e.shiftKey ? -1 : 1)
      break
    }
    case keys[2]: {
      scoreboard.scoreRight(e.shiftKey ? -1 : 1)
      break
    }
  }
})
