import {db} from '../firebase'
// eslint-disable-next-line no-unused-vars
import {collection, onSnapshot, doc, updateDoc, increment, writeBatch, setDoc, getDoc, Timestamp} from 'firebase/firestore'

export const startVoting = async () => {
    const timerRef = doc(db, 'timer', 'timer')
    const now = new Date()
    const timerEndsAt = new Date(now.getTime() + 60000) // 60 seconds from now
  
    await setDoc(timerRef, {
        votingEndsAt: Timestamp.fromDate(timerEndsAt),
        votingStarted: true
    })
}

export const listenToTimerChanges = (
    setTimerEnds,
    setSecondsLeft,
    determineWinner,
    setVisible
) => {
    return onSnapshot(doc(db, 'timer', 'timer'), (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data()
            const timerEndsAt = data.votingEndsAt.toDate()
            setTimerEnds(timerEndsAt)

            if (data.votingStarted && new Date() < timerEndsAt) {
                setVisible(true)
                const interval = setInterval(() => {
                    const now = new Date()
                    const timeLeft = Math.max(Math.floor((timerEndsAt - now) / 1000), 0)
                    setSecondsLeft(timeLeft)

                    if (timeLeft === 0) {
                        clearInterval(interval)
                        determineWinner()
                    }
                }, 1000)

                return () => clearInterval(interval)
            }
        }
    })
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