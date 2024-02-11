import {db} from '../firebase'
// eslint-disable-next-line no-unused-vars
import {collection, onSnapshot, doc, updateDoc, increment, writeBatch, setDoc, getDoc, Timestamp} from 'firebase/firestore'

export const startVoting = async (timerEnds, startCountdown, setTimerEnds, setVisible) => {
    const now = new Date()
    if (!timerEnds || now >= timerEnds) {
      // Timer expired, start a new voting session
      const newTimerEnds = new Date(now.getTime() + 10000) // 60 seconds from now
      const timerRef = doc(db, 'timer', 'timer')
      await setDoc(timerRef, { votingEndsAt: Timestamp.fromDate(newTimerEnds) })
      setTimerEnds(newTimerEnds)
      startCountdown(newTimerEnds)
    }
    setVisible(true)
}

export const handleVote = async (gameId, setVoteCast, setVisible) => {
    const gameRef = doc(db, 'games', gameId)
    await updateDoc(gameRef, { votes: increment(1) })
    setVoteCast(true)
    setVisible(false)
}

export const resetVotes = async (games) => {
    const batch = writeBatch(db)
    games.forEach(game => {
      const gameRef = doc(db, 'games', game.id)
      batch.update(gameRef, { votes: 0 })
    })
    await batch.commit()
  }