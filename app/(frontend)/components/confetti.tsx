import confetti from 'canvas-confetti'

const ConfettiAction = () => {
  confetti({
    spread: 70,
    origin: { y: 1 },
    colors: ['#008000'],
  })
}

export default ConfettiAction
