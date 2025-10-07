export interface Member {
  _id: string
  nameOfBusinessOwner: string
}

export interface Event {
  _id: string
  name: string
}

export interface Club {
  _id: string
  clubName: string
  since: string
  clubManager?: Member
  members: Member[]
  events: Event[]
  image?: string
}

export interface ClubFormData {
  clubName: string
  since: string
  clubManager: string
  members: string[]
  events: string[]
  image: string
}