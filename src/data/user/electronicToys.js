const electronicToys = [
  // REMOTE CONTROL TOYS (10)
  {
    id: 1,
    name: "Remote Control Car",
    image: "https://baybee.co.in/cdn/shop/files/71opsm_qR7L_1400x.jpg?v=1735995271",
    description: `High-speed remote control car for thrilling races.
    Smooth steering ensures easy control for kids.
    Durable wheels work on both indoor and outdoor surfaces.
    Perfect toy for exciting playtime and competitions.
    Built with strong materials for long-lasting use.
    Lightweight design makes it easy to carry anywhere.`,
    price: 4980,
    rating: 4.7,
    reviews: 267,
    category: "Electronic Toys",
    subcategory: "Remote Control Toys",
    badge: "Glow in Dark",
    gradient: "toy-gradient-4",
    ageGroup: ["6-8", "8-12"],
  },
  {
    id: 2,
    name: "Drone",
    image: "https://www.ul.com/sites/default/files/styles/hero_boxed_width/public/2019-05/Image18_Quadcopter-drone_Caban_022819-Hero-1000x715.jpg?itok=6WSk4wNj",
    description: `Easy-to-fly drone with stable flight controls.
    Altitude hold feature helps beginners fly smoothly.
    Supports HD camera for fun aerial views.
    Great for outdoor adventures and learning flying skills.
    Compact design makes it easy to store and carry.
    Durable body ensures safe landing and flying.`,
    price: 6640,
    rating: 4.5,
    reviews: 198,
    category: "Electronic Toys",
    subcategory: "Remote Control Toys",
    badge: "Editor's Pick",
    gradient: "toy-gradient-5",
    ageGroup: ["8-12"],
  },
  {
    id: 3,
    name: "RC Helicopter",
    image: "https://m.media-amazon.com/images/I/71SRXsLCMxL.jpg",
    description: `Lightweight RC helicopter with stable flying control.
    Easy to operate even for beginners.
    Rechargeable battery for long playtime.
    Great toy for indoor flying fun and learning control.
    Compact design ensures safe indoor usage.
    Improves hand-eye coordination and control skills.`,
    price: 3320,
    rating: 4.9,
    reviews: 432,
    category: "Electronic Toys",
    subcategory: "Remote Control Toys",
    badge: "⭐ Must Have",
    gradient: "toy-gradient-2",
    ageGroup: ["6-8", "8-12"],
  },
  {
    id: 4,
    name: "RC Monster Truck",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwMlzMGvC_jG1nzX1VcrT9rGdTni9rHOfVOg&s",
    description: `Powerful RC monster truck built for rough play.
    Oversized wheels handle multiple surfaces easily.
    Smooth remote response gives better control.
    Durable body helps with bumps and crashes.
    Great for racing fun indoors and outdoors.
    A thrilling toy for action-loving kids.`,
    price: 5299,
    rating: 4.8,
    reviews: 241,
    category: "Electronic Toys",
    subcategory: "Remote Control Toys",
    badge: "Hot Pick",
    gradient: "toy-gradient-1",
    ageGroup: ["6-8", "8-12"],
  },
  {
    id: 5,
    name: "RC Speed Boat",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXwujVUGP7TH1vzCtKDV01vMHbgFOFyOpcHA&s",
    description: `Fast RC speed boat for water racing fun.
    Streamlined body moves smoothly on calm water.
    Easy controls make it beginner friendly.
    Rechargeable battery supports extended playtime.
    Lightweight design allows easy carrying and storage.
    Great for kids who enjoy outdoor adventures.`,
    price: 5899,
    rating: 4.6,
    reviews: 166,
    category: "Electronic Toys",
    subcategory: "Remote Control Toys",
    badge: "Water Fun",
    gradient: "toy-gradient-6",
    ageGroup: ["8-12"],
  },
  {
    id: 6,
    name: "RC Stunt Car",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTiptwjABPSdwKAvjOxER6zItdVq0UYtLwYdw&s",
    description: `Exciting stunt car that flips and spins with ease.
    Dual-sided design keeps play going after flips.
    Easy remote operation for quick action fun.
    Strong body handles repeated stunt movement.
    Bright design makes it visually exciting.
    Perfect for energetic racing and stunt games.`,
    price: 4599,
    rating: 4.7,
    reviews: 203,
    category: "Electronic Toys",
    subcategory: "Remote Control Toys",
    badge: "Trending",
    gradient: "toy-gradient-3",
    ageGroup: ["6-8", "8-12"],
  },
  {
    id: 7,
    name: "RC Racing Bike",
    image: "https://imgd.aeplcdn.com/1280x720/n/2y6a0gb_1836049.jpg",
    description: `Remote control racing bike with sporty styling.
    Smooth steering offers better track movement.
    Lightweight build helps maintain balance during play.
    Rechargeable setup supports repeated fun sessions.
    Attractive racing design appeals to kids instantly.
    Great for indoor floor racing excitement.`,
    price: 4799,
    rating: 4.5,
    reviews: 149,
    category: "Electronic Toys",
    subcategory: "Remote Control Toys",
    badge: "Race Ready",
    gradient: "toy-gradient-4",
    ageGroup: ["6-8", "8-12"],
  },
  {
    id: 8,
    name: "RC Tank Toy",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpYW34goYAjtoRJ7a1VwqCq7nZcQbhp4A4Ww&s",
    description: `Battle-style RC tank toy for action playtime.
    Easy controls help kids move and rotate smoothly.
    Sturdy construction improves long-lasting durability.
    Great for imaginative mission and army games.
    Compact size makes storage simple after use.
    Adds excitement to remote-control collections.`,
    price: 5499,
    rating: 4.7,
    reviews: 175,
    category: "Electronic Toys",
    subcategory: "Remote Control Toys",
    badge: "Action Toy",
    gradient: "toy-gradient-5",
    ageGroup: ["6-8", "8-12"],
  },
  {
    id: 9,
    name: "Mini RC Car",
    image: "https://www.giftoo.in/cdn/shop/files/Car_5.png?v=1768636058&width=1946",
    description: `Compact mini RC car for quick racing fun.
    Small size makes it easy to use indoors.
    Responsive controls provide smooth movement.
    Durable body works well for everyday play.
    Great starter remote toy for younger kids.
    Easy to carry in a small bag.`,
    price: 2499,
    rating: 4.6,
    reviews: 138,
    category: "Electronic Toys",
    subcategory: "Remote Control Toys",
    badge: null,
    gradient: "toy-gradient-2",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 10,
    name: "RC Construction Excavator",
    image: "https://m.media-amazon.com/images/I/51jSr00vunL._AC_UF1000,1000_QL80_.jpg",
    description: `Remote control excavator for building-site role play.
    Movable arm adds extra realism and fun.
    Easy controls make digging action simple.
    Durable plastic body supports rough play.
    Encourages imaginative construction storytelling.
    A unique RC toy for kids who love machines.`,
    price: 6199,
    rating: 4.8,
    reviews: 212,
    category: "Electronic Toys",
    subcategory: "Remote Control Toys",
    badge: "Best Seller",
    gradient: "toy-gradient-6",
    ageGroup: ["6-8", "8-12"],
  },

  // INTERACTIVE TOYS (10)
  {
    id: 11,
    name: "Robot Kit",
    image: "https://img.freepik.com/free-photo/home-made-robot-desk_23-2148863420.jpg",
    description: `DIY robot kit for hands-on building experience.
    Includes motors and sensors for smart functionality.
    Encourages STEM learning and problem-solving skills.
    Perfect for creative kids who love engineering.
    Improves logical thinking and creativity.
    Easy-to-follow instructions for quick setup.`,
    price: 3730,
    rating: 4.8,
    reviews: 341,
    category: "Electronic Toys",
    subcategory: "Interactive Toys",
    badge: "Party Hit",
    gradient: "toy-gradient-6",
    ageGroup: ["6-8", "8-12"],
  },
  {
    id: 12,
    name: "Smart Toy Dog",
    image: "https://m.media-amazon.com/images/I/41Pmnm087yL._AC_UF1000,1000_QL80_.jpg",
    description: `Interactive smart dog that walks and barks.
    Responds to touch and performs fun actions.
    Engages kids with music and movement features.
    Perfect companion toy for fun and entertainment.
    Soft design makes it safe for kids.
    Encourages emotional bonding and play.`,
    price: 5810,
    rating: 4.7,
    reviews: 213,
    category: "Electronic Toys",
    subcategory: "Interactive Toys",
    badge: "STEM Kit",
    gradient: "toy-gradient-3",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 13,
    name: "Talking Robot",
    image: "https://c8.alamy.com/comp/FCEGBA/3d-render-of-a-robot-speaking-into-a-microphone-FCEGBA.jpg",
    description: `Interactive talking robot with lights and sounds.
    Repeats speech in a fun robotic voice.
    Movable arms and walking motion add excitement.
    Encourages kids to speak and engage actively.
    Durable body supports regular indoor play.
    A fun tech toy for curious children.`,
    price: 4299,
    rating: 4.7,
    reviews: 194,
    category: "Electronic Toys",
    subcategory: "Interactive Toys",
    badge: "Top Rated",
    gradient: "toy-gradient-1",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 14,
    name: "Smart Dino Toy",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSu82ll7d50VEnXycd7CL9vO4JV7dtSNsi2PQ&s",
    description: `Interactive dinosaur toy with sound and movement.
    Roars, walks, and lights up during playtime.
    Great for kids who love prehistoric adventures.
    Easy controls make it simple to enjoy.
    Durable design handles active everyday play.
    Adds action and excitement to toy time.`,
    price: 3899,
    rating: 4.6,
    reviews: 157,
    category: "Electronic Toys",
    subcategory: "Interactive Toys",
    badge: "Dino Fun",
    gradient: "toy-gradient-5",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 15,
    name: "Interactive Baby Doll",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGgXeNHsSPZj2WQG8vX7rRPRLhmkGpYgq5-A&s",
    description: `Talking baby doll with realistic sound effects.
    Responds with giggles, words, and soft music.
    Encourages nurturing and pretend role play.
    Soft features make it friendly for kids.
    Lightweight design is easy to carry around.
    A lovable companion for everyday fun.`,
    price: 3499,
    rating: 4.5,
    reviews: 146,
    category: "Electronic Toys",
    subcategory: "Interactive Toys",
    badge: "Cute Pick",
    gradient: "toy-gradient-4",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 16,
    name: "Smart Toy Cat",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsHTe1eitdBHC9MFFMdl7SOoAPYmJ_nIDRgA&s",
    description: `Interactive toy cat that meows and moves gently.
    Touch response makes play feel more lifelike.
    Great for kids who love pet-style toys.
    Soft outer design feels friendly and safe.
    Easy controls support independent play sessions.
    Brings joy through music and playful actions.`,
    price: 3699,
    rating: 4.6,
    reviews: 132,
    category: "Electronic Toys",
    subcategory: "Interactive Toys",
    badge: null,
    gradient: "toy-gradient-2",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 17,
    name: "Voice Control Robot",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_RF4WKypjozPAPFhdd_bPOHWezqLw_UXvcA&s",
    description: `Voice control robot responds to simple commands.
    Walks, dances, and lights up during use.
    Encourages interactive tech-based learning.
    Great for kids interested in smart gadgets.
    Rechargeable battery supports longer playtime.
    Makes play more futuristic and exciting.`,
    price: 6299,
    rating: 4.8,
    reviews: 224,
    category: "Electronic Toys",
    subcategory: "Interactive Toys",
    badge: "Smart Pick",
    gradient: "toy-gradient-6",
    ageGroup: ["6-8", "8-12"],
  },
  {
    id: 18,
    name: "Interactive Story Bear",
    image: "https://m.media-amazon.com/images/I/71d7u9sYVKL._AC_UF1000,1000_QL80_.jpg",
    description: `Storytelling bear plays sounds and gentle voice clips.
    Designed to comfort and entertain younger kids.
    Soft body makes it pleasant to cuddle.
    Easy buttons trigger fun audio interactions.
    Safe construction supports everyday play.
    Perfect bedtime companion for little ones.`,
    price: 3199,
    rating: 4.7,
    reviews: 118,
    category: "Electronic Toys",
    subcategory: "Interactive Toys",
    badge: "Bedtime Buddy",
    gradient: "toy-gradient-3",
    ageGroup: ["0-2", "3-5"],
  },
  {
    id: 19,
    name: "Gesture Control Robot",
    image: "https://m.media-amazon.com/images/I/61fF8ZlzqFL._AC_UF1000,1000_QL80_.jpg",
    description: `Gesture control robot reacts to hand movement.
    Walks, turns, and dances with fun actions.
    Helps kids explore modern toy technology.
    Strong build supports regular active use.
    Colourful lights make playtime more engaging.
    Great gift for gadget-loving kids.`,
    price: 5599,
    rating: 4.8,
    reviews: 187,
    category: "Electronic Toys",
    subcategory: "Interactive Toys",
    badge: "Future Fun",
    gradient: "toy-gradient-5",
    ageGroup: ["6-8", "8-12"],
  },
  {
    id: 20,
    name: "Interactive Pet Parrot",
    image: "https://m.media-amazon.com/images/I/61yM4D7Q9rL._AC_UF1000,1000_QL80_.jpg",
    description: `Talking pet parrot repeats words in a funny style.
    Bright look attracts children's attention quickly.
    Encourages speaking and playful interaction.
    Easy controls make it fun for all ages.
    Durable body supports repeated use.
    A cheerful toy for lively play sessions.`,
    price: 2999,
    rating: 4.5,
    reviews: 109,
    category: "Electronic Toys",
    subcategory: "Interactive Toys",
    badge: "Fun Voice",
    gradient: "toy-gradient-1",
    ageGroup: ["3-5", "6-8"],
  },

  // MUSICAL TOYS (10)
  {
    id: 21,
    name: "Electronic Drum Set",
    image: "https://cdn.shopaccino.com/master-music/products/1-864460_m.jpg?v=684",
    description: `Fun electronic drum set with multiple sound modes.
    Built-in speakers give realistic music experience.
    Lightweight and easy to use for kids.
    Perfect toy to explore rhythm and music creativity.
    Includes demo beats for easy learning.
    Improves timing and musical skills.`,
    price: 4150,
    rating: 4.6,
    reviews: 155,
    category: "Electronic Toys",
    subcategory: "Musical Toys",
    badge: "Super Scary",
    gradient: "toy-gradient-1",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 22,
    name: "Kids Piano Keyboard",
    image: "https://m.media-amazon.com/images/I/71LHdcPbxQL._AC_UF1000,1000_QL80_.jpg",
    description: `24-key piano keyboard with built-in melodies.
    Multiple instrument modes for musical variety.
    Microphone included for singing along.
    Record and playback feature for practice.
    Colorful keys make learning notes fun.
    Runs on batteries for anywhere play.`,
    price: 2199,
    rating: 4.6,
    reviews: 178,
    category: "Electronic Toys",
    subcategory: "Musical Toys",
    badge: "Trending",
    gradient: "toy-gradient-4",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 23,
    name: "Musical Guitar Toy",
    image: "https://m.media-amazon.com/images/I/71dA3h6cvKL._AC_UF1000,1000_QL80_.jpg",
    description: `Kids musical guitar with fun sound and light effects.
    Easy-to-press buttons support simple learning.
    Bright colours make it attractive for children.
    Great for introducing rhythm and melody.
    Lightweight body is easy to carry.
    Encourages interest in music through play.`,
    price: 2499,
    rating: 4.5,
    reviews: 133,
    category: "Electronic Toys",
    subcategory: "Musical Toys",
    badge: "Music Fun",
    gradient: "toy-gradient-2",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 24,
    name: "DJ Mixer Toy",
    image: "https://m.media-amazon.com/images/I/61n5X2Q7bEL._AC_UF1000,1000_QL80_.jpg",
    description: `Electronic DJ mixer toy for energetic play sessions.
    Sound buttons create fun music combinations.
    Flashing lights make performance more exciting.
    Easy controls suit younger music lovers.
    Helps kids explore beats and rhythm creatively.
    Great party-style toy for playful fun.`,
    price: 2899,
    rating: 4.6,
    reviews: 141,
    category: "Electronic Toys",
    subcategory: "Musical Toys",
    badge: "Party Favorite",
    gradient: "toy-gradient-5",
    ageGroup: ["6-8", "8-12"],
  },
  {
    id: 25,
    name: "Musical Microphone Stand",
    image: "https://m.media-amazon.com/images/I/71W4oN3v6tL._AC_UF1000,1000_QL80_.jpg",
    description: `Microphone stand toy for singing and performance fun.
    Built-in tunes add excitement to every session.
    Adjustable height improves comfort for kids.
    Bright stage-style design looks attractive.
    Encourages confidence and creative expression.
    Great for pretend concerts at home.`,
    price: 3299,
    rating: 4.7,
    reviews: 152,
    category: "Electronic Toys",
    subcategory: "Musical Toys",
    badge: "Stage Star",
    gradient: "toy-gradient-3",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 26,
    name: "Musical Saxophone Toy",
    image: "https://m.media-amazon.com/images/I/61P4U2f7M-L._AC_UF1000,1000_QL80_.jpg",
    description: `Colourful toy saxophone with fun sound features.
    Easy finger buttons encourage music exploration.
    Lightweight design suits young children well.
    Bright look keeps kids engaged during play.
    Great for pretend band and rhythm games.
    Inspires creativity through musical discovery.`,
    price: 1899,
    rating: 4.4,
    reviews: 97,
    category: "Electronic Toys",
    subcategory: "Musical Toys",
    badge: null,
    gradient: "toy-gradient-6",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 27,
    name: "Baby Musical Mat",
    image: "https://m.media-amazon.com/images/I/71zv1xmfDwL._AC_UF1000,1000_QL80_.jpg",
    description: `Interactive musical mat responds to foot and hand taps.
    Plays fun notes and melodies during movement.
    Soft foldable design is easy to store.
    Helps babies enjoy sound and active play together.
    Bright printed layout keeps attention longer.
    Great for sensory and musical development.`,
    price: 2799,
    rating: 4.7,
    reviews: 173,
    category: "Electronic Toys",
    subcategory: "Musical Toys",
    badge: "Active Play",
    gradient: "toy-gradient-1",
    ageGroup: ["0-2", "3-5"],
  },
  {
    id: 28,
    name: "Electronic Violin Toy",
    image: "https://m.media-amazon.com/images/I/61A7oV4vWkL._AC_UF1000,1000_QL80_.jpg",
    description: `Violin-style toy with light and sound effects.
    Smooth controls make pretend playing simple.
    Great for introducing orchestral music concepts.
    Attractive design appeals to little performers.
    Battery-operated setup supports mobile play.
    Encourages creativity and stage confidence.`,
    price: 2399,
    rating: 4.5,
    reviews: 106,
    category: "Electronic Toys",
    subcategory: "Musical Toys",
    badge: "Performer Pick",
    gradient: "toy-gradient-4",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 29,
    name: "Mini Musical Tambourine",
    image: "https://m.media-amazon.com/images/I/61tH2X8wQ9L._AC_UF1000,1000_QL80_.jpg",
    description: `Electronic tambourine toy with bright sounds and lights.
    Easy to shake and play for quick fun.
    Compact size is perfect for toddler hands.
    Encourages rhythm recognition and active movement.
    Colourful design keeps children engaged.
    A fun starter music toy for young kids.`,
    price: 1499,
    rating: 4.4,
    reviews: 89,
    category: "Electronic Toys",
    subcategory: "Musical Toys",
    badge: "Tiny Beats",
    gradient: "toy-gradient-2",
    ageGroup: ["0-2", "3-5"],
  },
  {
    id: 30,
    name: "Kids Karaoke Machine",
    image: "https://m.media-amazon.com/images/I/71Ww6LrM1QL._AC_UF1000,1000_QL80_.jpg",
    description: `Portable karaoke machine for singing fun at home.
    Includes microphone and speaker for lively play.
    Easy controls make it suitable for kids.
    Built-in songs add instant entertainment.
    Rechargeable setup improves convenience.
    Perfect for parties and playful performances.`,
    price: 4499,
    rating: 4.8,
    reviews: 196,
    category: "Electronic Toys",
    subcategory: "Musical Toys",
    badge: "Top Singer",
    gradient: "toy-gradient-5",
    ageGroup: ["6-8", "8-12"],
  },

  // BATTERY OPERATED TOYS (10)
  {
    id: 31,
    name: "Talking Learning Tablet",
    image: "https://m.media-amazon.com/images/I/61VznmhwCuL._AC_UF1000,1000_QL80_.jpg",
    description: `Interactive learning tablet with touch screen.
    Teaches alphabets, numbers, colours and shapes.
    Multiple languages supported for bilingual learning.
    Engaging games and quizzes for young minds.
    Durable child-proof casing for rough handling.
    Safe screen with eye-care technology for kids.`,
    price: 1899,
    rating: 4.5,
    reviews: 134,
    category: "Electronic Toys",
    subcategory: "Battery Operated Toys",
    badge: null,
    gradient: "toy-gradient-5",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 32,
    name: "Battery Operated Toy Train",
    image: "https://m.media-amazon.com/images/I/71K8W6d6LOL._AC_UF1000,1000_QL80_.jpg",
    description: `Battery train toy with lights and moving action.
    Smooth motion keeps kids entertained longer.
    Colourful design makes it visually appealing.
    Easy controls are perfect for young children.
    Durable body supports regular playtime use.
    Great for rail-themed pretend adventures.`,
    price: 2299,
    rating: 4.6,
    reviews: 121,
    category: "Electronic Toys",
    subcategory: "Battery Operated Toys",
    badge: "Classic Fun",
    gradient: "toy-gradient-3",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 33,
    name: "Light Up Dancing Duck",
    image: "https://m.media-amazon.com/images/I/71L1kP3zX1L._AC_UF1000,1000_QL80_.jpg",
    description: `Cute dancing duck toy with lights and music.
    Walks around while playing cheerful tunes.
    Fun movement keeps babies and toddlers engaged.
    Colourful flashing lights add excitement.
    Battery operation makes it easy to use anywhere.
    A joyful toy for active little ones.`,
    price: 1599,
    rating: 4.5,
    reviews: 97,
    category: "Electronic Toys",
    subcategory: "Battery Operated Toys",
    badge: "Baby Favorite",
    gradient: "toy-gradient-1",
    ageGroup: ["0-2", "3-5"],
  },
  {
    id: 34,
    name: "Battery Operated Rabbit",
    image: "https://m.media-amazon.com/images/I/61Qd2XvM+XL._AC_UF1000,1000_QL80_.jpg",
    description: `Adorable rabbit toy that hops with sound effects.
    Soft look makes it appealing for younger kids.
    Easy battery setup supports quick play.
    Lightweight body is simple to carry around.
    Helps children enjoy movement-based fun.
    Great gift for playful toddlers.`,
    price: 1499,
    rating: 4.4,
    reviews: 88,
    category: "Electronic Toys",
    subcategory: "Battery Operated Toys",
    badge: null,
    gradient: "toy-gradient-4",
    ageGroup: ["0-2", "3-5"],
  },
  {
    id: 35,
    name: "Battery Operated Fish Toy",
    image: "https://m.media-amazon.com/images/I/71n4hQjM7SL._AC_UF1000,1000_QL80_.jpg",
    description: `Swimming fish toy with moving tail and lights.
    Bright colours attract children's attention quickly.
    Battery-powered action keeps play fun and simple.
    Great for sensory and visual engagement.
    Durable build helps with repeated use.
    Adds playful movement to toy collections.`,
    price: 1399,
    rating: 4.3,
    reviews: 74,
    category: "Electronic Toys",
    subcategory: "Battery Operated Toys",
    badge: "Underwater Fun",
    gradient: "toy-gradient-6",
    ageGroup: ["0-2", "3-5"],
  },
  {
    id: 36,
    name: "Crawling Baby Toy",
    image: "https://m.media-amazon.com/images/I/71hW8mD7kJL._AC_UF1000,1000_QL80_.jpg",
    description: `Battery-operated crawling baby toy for active fun.
    Moves forward with lights and playful sounds.
    Encourages babies to follow and stay active.
    Safe body design is suitable for young kids.
    Bright look keeps attention during playtime.
    A lively toy for developmental fun.`,
    price: 2199,
    rating: 4.6,
    reviews: 143,
    category: "Electronic Toys",
    subcategory: "Battery Operated Toys",
    badge: "Active Baby",
    gradient: "toy-gradient-2",
    ageGroup: ["0-2"],
  },
  {
    id: 37,
    name: "Battery Operated Bus",
    image: "https://m.media-amazon.com/images/I/71Q5N3t0ffL._AC_UF1000,1000_QL80_.jpg",
    description: `Colourful bus toy with lights and moving wheels.
    Plays music while driving around the floor.
    Durable design handles regular active play.
    Bright shape appeals to toddlers and young kids.
    Battery operation keeps setup easy and convenient.
    Great for transport-themed fun at home.`,
    price: 1999,
    rating: 4.5,
    reviews: 112,
    category: "Electronic Toys",
    subcategory: "Battery Operated Toys",
    badge: "Travel Toy",
    gradient: "toy-gradient-5",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 38,
    name: "Light and Sound Gun Toy",
    image: "https://m.media-amazon.com/images/I/71b9w4o7YML._AC_UF1000,1000_QL80_.jpg",
    description: `Action toy with exciting light and sound effects.
    Easy press controls trigger playful sounds.
    Durable body suits active pretend play.
    Bright design adds excitement for kids.
    Battery-powered setup is simple to use.
    Great for dramatic action-themed games.`,
    price: 1799,
    rating: 4.4,
    reviews: 93,
    category: "Electronic Toys",
    subcategory: "Battery Operated Toys",
    badge: "Action Fun",
    gradient: "toy-gradient-3",
    ageGroup: ["6-8", "8-12"],
  },
  {
    id: 39,
    name: "Spinning Light Top Toy",
    image: "https://m.media-amazon.com/images/I/61V8nN4kHfL._AC_UF1000,1000_QL80_.jpg",
    description: `Battery top toy spins with colourful light effects.
    Compact design makes it easy to carry anywhere.
    Smooth movement keeps kids entertained.
    Great for sensory and visual play sessions.
    Strong plastic body improves durability.
    A simple but exciting toy for children.`,
    price: 999,
    rating: 4.3,
    reviews: 81,
    category: "Electronic Toys",
    subcategory: "Battery Operated Toys",
    badge: "Light Show",
    gradient: "toy-gradient-1",
    ageGroup: ["0-2", "3-5"],
  },
  {
    id: 40,
    name: "Battery Operated Dancing Cactus",
    image: "https://m.media-amazon.com/images/I/61i1kD3+wtL._AC_UF1000,1000_QL80_.jpg",
    description: `Dancing cactus toy that sings and repeats sounds.
    Funny movements keep kids entertained for hours.
    Soft outer finish makes it pleasant to touch.
    Easy controls support independent use.
    Great for laughter-filled family playtime.
    A fun trending toy for all ages.`,
    price: 1699,
    rating: 4.7,
    reviews: 211,
    category: "Electronic Toys",
    subcategory: "Battery Operated Toys",
    badge: "Viral Pick",
    gradient: "toy-gradient-4",
    ageGroup: ["3-5", "6-8"],
  },
];

export default electronicToys;