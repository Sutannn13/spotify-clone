export type LyricsType = "plain" | "lrc";

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  audioUrl: string;
  coverUrl: string;
  lyrics: string;
  lyricsType: LyricsType;
  duration?: number;
}

export const songs: Song[] = [
  {
    id: "1",
    title: "Midnight Reverie",
    artist: "The Ambient Collective",
    album: "Nocturnal Sessions",
    audioUrl: "/songs/midnight-reverie.mp3",
    coverUrl: "https://images.unsplash.com/photo-1614149162883-504ce4d13971?w=400&h=400&fit=crop",
    lyrics: `[00:00.00] Midnight Reverie
[00:04.50]
[00:08.20] Streets below are quiet now
[00:12.80] Neon signs hum alow
[00:17.40] I'm awake in the small hours
[00:22.10] chasing thoughts that still remain
[00:28.00]
[00:32.50] Memory is a fragile thing
[00:37.20] like glass that caught the light
[00:42.00] I hold it close and wonder
[00:46.80] what became of all those nights
[00:53.00]
[01:00.30] We used to dance until the dawn
[01:05.10] forgot our fears and names
[01:10.00] Now the music plays on silently
[01:14.80] and nothing's quite the same
[01:22.50]
[01:30.00] Midnight reverie takes me
[01:35.20] back to where we've been
[01:40.00] Through the haze of city lights
[01:44.80] I still see you again
[02:00.00]
[02:05.50] Instrumental interlude
[02:30.00]
[02:35.20] Time moves on but some things stay
[02:40.00] written on the wall
[02:44.80] A midnight song for those who've gone
[02:49.60] and those who still recall
[02:56.00]
[03:05.30] Midnight reverie, I'm lost
[03:10.00] in memories of you
[03:14.80] Through every fading echo
[03:19.50] I still find traces true
[03:30.00]
[03:35.00] End of reverie
[03:40.00]`,
    lyricsType: "lrc",
    duration: 220,
  },
  {
    id: "2",
    title: "Velvet Horizons",
    artist: "Lena Voss",
    album: "Drift",
    audioUrl: "/songs/velvet-horizons.mp3",
    coverUrl: "https://images.unsplash.com/photo-1557682254-529c4c0a3e28?w=400&h=400&fit=crop",
    lyrics: `[00:00.00] Velvet Horizons
[00:06.00]
[00:12.00] The road unwinds beneath the wheel
[00:17.00] golden light across the plain
[00:22.00] I've been driving since the morning
[00:27.00] chasing something I can't name
[00:34.00]
[00:40.00] Velvet horizons stretch so far
[00:45.00] touching sky and earth alike
[00:50.00] Every mile a clean horizon
[00:55.00] every breath a quiet strike
[01:03.00]
[01:10.00] We are all just passing through
[01:15.00] this world so vast and wide
[01:20.00] finding meaning in the motion
[01:25.00] as the miles roll on with time
[01:33.00]
[01:40.00] Radio plays something old
[01:45.00] something that reminds me of
[01:50.00] all the places left behind
[01:55.00] and all the things I've fallen in love
[02:05.00]
[02:10.00] Velvet horizons call me home
[02:15.00] wherever that may be
[02:20.00] I'm a traveler by nature
[02:25.00] and the road sets me free
[02:40.00]
[02:45.00] Instrumental
[03:20.00]
[03:28.00] The sun is setting crimson
[03:33.00] painting clouds in orange hues
[03:38.00] Another day is ending
[03:43.00] and I haven't got the blues
[03:50.00]
[03:56.00] Velvet horizons fade to dark
[04:01.00] but morning always comes
[04:06.00] Another chance to start again
[04:11.00] another day to run
[04:20.00]`,
    lyricsType: "lrc",
    duration: 260,
  },
  {
    id: "3",
    title: "Still Waters",
    artist: "Caspian Wave",
    album: "Depths",
    audioUrl: "/songs/still-waters.mp3",
    coverUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop",
    lyrics: `Beneath the surface where the light can't reach
Still waters run deep and still
I've been collecting all the quiet things
The space between the noise and will

The current pulls but I remain composed
A stillness that the storm can't shake
Some depths were made for introspection
Not for the noise that others make

Still waters, quiet fire
Burning low beneath the skin
I've learned to hold my own tempo
And let the world spin without me in

The surface shows the calm reflection
But underneath there's motion true
Every depth has its own current
Every silence has its view

Still waters run their own direction
Through channels carved by time and trust
I've found a peace within the quiet
That noise will never quite discuss

Still waters, still remaining
Holding space that's truly mine
The world may rush and the world may thunder
But still waters teach me fine`,
    lyricsType: "plain",
    duration: 198,
  },
  {
    id: "4",
    title: "Carbon Arc",
    artist: "Obsidian Signal",
    album: "Transmission",
    audioUrl: "/songs/carbon-arc.mp3",
    coverUrl: "https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=400&h=400&fit=crop",
    lyrics: `[00:00.00] Carbon Arc
[00:05.00]
[00:10.00] Electricity runs through the wire
[00:14.00] bridging gap between the poles
[00:19.00] The arc is bright and pure and high
[00:23.00] a signal from the northern zone
[00:30.00]
[00:36.00] Carbon burns at 4000 degrees
[00:41.00] converting all the darkness into light
[00:46.00] I've been sparked and I've been fused
[00:51.00] and pulled apart by invisible might
[01:00.00]
[01:06.00] The circuit keeps completing
[01:10.00] electrons find their way
[01:15.00] Through copper wire and patience
[01:20.00] they light the smallest day
[01:28.00]
[01:35.00] Carbon arc, bright and fleeting
[01:40.00] the gap is closing fast
[01:45.00] Two poles are drawing together
[01:50.00] leaving shadows from the past
[02:00.00]
[02:05.00] Every connection leaves a mark
[02:10.00] a trace of what was there
[02:15.00] Carbon deposits on the surface
[02:20.00] evidence of charge and care
[02:30.00]
[02:36.00] Now the arc has finally faded
[02:41.00] leaving only glowing char
[02:46.00] But the circuit still remembers
[02:51.00] what we burned to leave this scar
[03:00.00]`,
    lyricsType: "lrc",
    duration: 200,
  },
  {
    id: "5",
    title: "Gentle Erosion",
    artist: "Coastal Theory",
    album: "Ephemera",
    audioUrl: "/songs/gentle-erosion.mp3",
    coverUrl: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&h=400&fit=crop",
    lyrics: `[00:00.00] Gentle Erosion
[00:04.00]
[00:09.00] The tide comes in a little further
[00:14.00] Each wave takes just a grain
[00:19.00] Not dramatic, not a storm
[00:23.00] just time working its domain
[00:30.00]
[00:35.00] Cliff faces made of ancient stone
[00:40.00] slowly surrender to the sea
[00:45.00] A million tiny negotiations
[00:50.00] wearing down what used to be
[00:58.00]
[01:05.00] Gentle erosion of the heart
[01:10.00] works the same way as the shore
[01:15.00] Small disappointments, small betrayals
[01:20.00] accumulating ever more
[01:28.00]
[01:35.00] You don't notice it happening
[01:40.00] until one day you see
[01:45.00] The coastline has retreated
[01:50.00] and there's less of you than used to be
[02:00.00]
[02:06.00] Yet the ocean keeps her patience
[02:11.00] working with a humble plan
[02:16.00] She doesn't fight or force or hurry
[02:21.00] she just continues, wave by wave, again
[02:30.00]
[02:36.00] Gentle erosion of the ego
[02:41.00] softening the stone
[02:46.00] Perhaps what the tide is taking
[02:51.00] is what we should have never known
[03:00.00]
[03:06.00] The cliff stands diminished
[03:11.00] but she's still standing there
[03:16.00] Eroded but existing
[03:21.00] worn down but still aware
[03:30.00]`,
    lyricsType: "lrc",
    duration: 215,
  },
  {
    id: "6",
    title: "Quiet Confession",
    artist: "Nora Velle",
    album: "Soft Architecture",
    audioUrl: "/songs/quiet-confession.mp3",
    coverUrl: "https://images.unsplash.com/photo-1518837695005-20834fcb3ae5?w=400&h=400&fit=crop",
    lyrics: `[00:00.00] Quiet Confession
[00:06.00]
[00:12.00] I want to tell you something
[00:16.00] but the words get lost in my throat
[00:21.00] It's been sitting here for years
[00:25.00] like a stone I can't promote
[00:32.00]
[00:37.00] There's a letter in my drawer
[00:42.00] written out a hundred ways
[00:47.00] Each draft feels like a failure
[00:51.00] each word feels like a phrase
[00:58.00]
[01:04.00] A quiet confession buried
[01:09.00] beneath the ordinary days
[01:14.00] I walk past you in the hallway
[01:19.00] and I let it go to haze
[01:26.00]
[01:32.00] What if I just said it plainly
[01:37.00] without all the careful art?
[01:42.00] The truth is plain enough already
[01:47.00] it doesn't need the clever part
[01:55.00]
[02:01.00] I confess that I'm afraid
[02:06.00] of making something fine
[02:11.00] The confession itself
[02:16.00] is simpler than this line
[02:23.00]
[02:28.00] I just need to know you hear me
[02:33.00] not the story I have told
[02:38.00] A quiet word, a quiet moment
[02:43.00] is all I want to hold
[02:52.00]
[02:58.00] So here it is, unvarnished
[03:03.00] the truth without the weight
[03:08.00] The quiet confession offered
[03:13.00] at the very simplest rate
[03:20.00]`,
    lyricsType: "lrc",
    duration: 200,
  },
];
