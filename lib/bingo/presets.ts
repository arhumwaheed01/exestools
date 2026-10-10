// lib/bingo/presets.ts
// Starter lists, written for ExesTools (original wording). Every preset loads into the
// textarea as plain lines, so it is fully editable. Family friendly; no prize-game wording.
// Sight words: the Dolch pre-primer list (public domain, Edward W. Dolch, 1936/1948).

export interface Preset {
  id: string;
  label: string; // button text
  title: string; // default card title
  size: 3 | 4 | 5;
  free: boolean;
  hint: string; // one-line host tip shown under the list after loading
  items: string[];
}

const L = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

export const PRESETS: Preset[] = [
  {
    id: "baby-shower", label: "Baby shower", title: "Baby Shower Bingo", size: 5, free: true,
    hint: "Gift bingo: guests mark a square when a matching present is unwrapped.",
    items: L(`Onesie
Swaddle blanket
Board book
Pacifier
Bottle set
Bath towel with hood
Rattle
Bibs
Diaper cream
Baby monitor
Socks
Sun hat
Teething ring
Stroller toy
Nursing pillow
Burp cloths
Night light
Baby shampoo
Soft blocks
Crib sheet
Bouncer
Diaper bag
Stuffed bunny
Mittens
Changing pad
Baby carrier
Photo album
Sleep sack
Hair brush set
Activity mat
Thermometer
Bath toys`),
  },
  {
    id: "christmas", label: "Christmas", title: "Christmas Bingo", size: 5, free: true,
    hint: "Call items from the caller below, or play spot-it bingo while watching a holiday film.",
    items: L(`Snowman
Candy cane
Reindeer
Stocking
Wreath
Ginger­bread house
Mistletoe
Sleigh
Elf
Hot cocoa
Snowflake
Present
Tree lights
Star on top
Carolers
Chimney
Mittens
Ornament
Holly
North Pole
Cookies for Santa
Ice skates
Scarf
Jingle bell
Snow globe
Ugly sweater
Wrapping paper
Fireplace
Pine cone
Candle
Nutcracker
Sled`),
  },
  {
    id: "halloween", label: "Halloween", title: "Halloween Bingo", size: 5, free: true,
    hint: "Kid friendly: no gore. Good for class parties and trunk-or-treat.",
    items: L(`Pumpkin
Black cat
Friendly ghost
Witch hat
Broomstick
Bat
Spider web
Candy corn
Costume
Full moon
Owl
Haunted house
Jack-o'-lantern
Trick-or-treat bag
Scarecrow
Cauldron
Mummy
Skeleton dance
Caramel apple
Monster mask
Glow stick
Lollipop
Cobweb
Lantern
Magic wand
Treat bucket
Vampire cape
Fallen leaves
Hay ride
Pirate patch`),
  },
  {
    id: "thanksgiving", label: "Thanksgiving", title: "Thanksgiving Bingo", size: 5, free: true,
    hint: "Try a gratitude rule: whoever gets bingo says one thing they're thankful for.",
    items: L(`Turkey
Pumpkin pie
Cranberry sauce
Mashed potatoes
Gravy
Stuffing
Corn on the cob
Football game
Parade
Pilgrim hat
Cornucopia
Apple cider
Pecan pie
Dinner rolls
Green beans
Sweet potatoes
Gratitude
Family photo
Leftovers
Wishbone
Autumn leaves
Acorn
Scarecrow
Harvest
Napkin ring
Table setting
Nap on the couch
Grandma's recipe
Gourd
Hay bale`),
  },
  {
    id: "new-year", label: "New Year's", title: "New Year's Eve Bingo", size: 5, free: true,
    hint: "Fill squares as they happen during the countdown evening.",
    items: L(`Countdown
Confetti
Party hat
Noisemaker
Fireworks
Resolution
Midnight hug
Sparkling juice toast
Ball drop
Calendar
Clock striking 12
Balloons
Streamers
Auld Lang Syne
Selfie
Dance party
Glitter
Someone yawns
Group photo
Late-night snack
New planner
Happy New Year text
Best moment of the year
Year-in-review
Party blower
Paper crown
Sparkler
Snacks table
Goal list
Wish for next year`),
  },
  {
    id: "sight-words", label: "Sight words (K–1)", title: "Sight Word Bingo", size: 4, free: false,
    hint: "Dolch pre-primer words. Say the word, use it in a short sentence, then let students find it.",
    items: L(`a
and
away
big
blue
can
come
down
find
for
funny
go
help
here
I
in
is
it
jump
little
look
make
me
my
not
one
play
red
run
said
see
the
three
to
two
up
we
where
yellow
you`),
  },
  {
    id: "math-facts", label: "Math facts", title: "Times Table Bingo", size: 5, free: true,
    hint: "The caller shows a fact. Read out only the answer; students find the fact that makes it.",
    items: L(`2 × 2
2 × 3
2 × 5
2 × 7
2 × 9
3 × 3
3 × 5
3 × 7
3 × 9
4 × 4
4 × 5
4 × 7
4 × 9
5 × 5
5 × 7
5 × 9
4 × 6
6 × 7
6 × 8
6 × 9
7 × 7
7 × 8
7 × 9
8 × 8
8 × 9
9 × 9
3 × 4
2 × 11
4 × 11
5 × 11`),
  },
  {
    id: "meeting", label: "Meeting / buzzword", title: "Meeting Bingo", size: 5, free: true,
    hint: "Everyone opens their own card link and taps squares quietly. Keep it kind and in good fun.",
    items: L(`You're on mute
Can everyone see my screen?
Let's circle back
Quick sync
Action items
Hard stop
Take it offline
Bandwidth
Low-hanging fruit
Deep dive
Touch base
Moving forward
On the same page
Ballpark figure
Can you hear me?
Sorry, go ahead
Next steps
Let's park that
Big picture
Win-win
Loop in
Dog barks
Frozen video
Someone joins late
Follow-up email
Per my last message
Any questions?
Thanks, everyone
Running a bit late
Game changer
Pivot
Calendar invite`),
  },
  {
    id: "road-trip", label: "Road trip", title: "Road Trip Bingo", size: 5, free: true,
    hint: "No caller needed: players mark what they spot out the window.",
    items: L(`Red car
Cow
Bridge
Gas station
School bus
Motorcycle
Water tower
Horse
Speed limit sign
Train
Windmill
Police car
Tunnel
Bicycle
Camper van
Stop sign
Truck with logo
Lake or river
Billboard
Dog in a car
Construction cone
Airplane
Out-of-state plate
Barn
Traffic light
Rest stop
Flag
Yellow car
Tractor
Picnic table
Mountain
Ice cream sign`),
  },
  {
    id: "bridal-shower", label: "Bridal shower", title: "Bridal Shower Bingo", size: 5, free: true,
    hint: "Gift bingo works here too, or call the couple's story moments.",
    items: L(`Wine glasses
Towel set
Cookbook
Picture frame
Candles
Mixing bowls
Blender
Bath robe
Plant
Throw pillow
Coffee maker
Recipe cards
Serving tray
Cutting board
Bed sheets
Scented soap
Photo album
Tea set
Measuring cups
Spa basket
Toaster
Mugs
Dish towels
Vase
Garden tools
Apron
Cake stand
Honeymoon guidebook
Tablecloth
Jewelry box`),
  },
  {
    id: "birthday", label: "Birthday party", title: "Birthday Party Bingo", size: 4, free: false,
    hint: "4×4 keeps games short for younger kids.",
    items: L(`Cake
Candles
Balloons
Party hat
Presents
Singing
Ice cream
Confetti
Card
Wrapping paper
Streamers
Goody bag
Pizza
Make a wish
Party games
Cupcake
Bow
Juice box
Photo
Piñata
Sprinkles
Dance
Banner
Thank you
Musical chairs
Face paint`),
  },
  {
    id: "office-party", label: "Office party", title: "Office Party Bingo", size: 5, free: true,
    hint: "A mixer: find a coworker who matches a square and write their name in it.",
    items: L(`Has a pet
Speaks two languages
Plays an instrument
Ran a race this year
Brought a homemade dish
Wearing something red
Has been here 5+ years
Started this year
Likes spicy food
Can juggle
Born in winter
Has visited 3+ countries
Bikes to work
Grows a plant at their desk
Loves board games
Has a sibling at work
Drinks tea, not coffee
Is left-handed
Has met a celebrity
Reads before bed
Cooks every weekend
Has a hidden talent
Takes photos for fun
Volunteers locally
Watches baking shows
Prefers mornings
Knows a magic trick
Wears glasses
Had a fun summer trip
Tells a great joke`),
  },
];

export const presetById = (id: string) => PRESETS.find((p) => p.id === id);
export const presetText = (p: Preset) => p.items.join("\n");
