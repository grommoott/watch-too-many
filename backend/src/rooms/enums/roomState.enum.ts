const RoomStates = {
    Playing: "playing",
    Paused: "paused",
    Loading: "loading"
} as const

type RoomState = typeof RoomStates[keyof typeof RoomStates]

export { RoomStates, RoomState }
