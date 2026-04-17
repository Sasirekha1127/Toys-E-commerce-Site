const educationalToys = [
  // LEARNING KITS (10)
  {
    id: 1,
    name: "Math Learning Blocks",
    image: "https://i0.wp.com/magrid.education/wp-content/uploads/2023/07/1.jpg",
    description: `Colorful math blocks for fun number learning.
    Helps kids understand counting and basic arithmetic.
    Encourages hands-on learning through play.
    Improves addition and subtraction skills easily.
    Bright colors attract kids' attention quickly.
    Enhances problem-solving and logical thinking.`,
    price: 1500,
    rating: 4.7,
    reviews: 189,
    category: "Educational Toys",
    subcategory: "Learning Kits",
    badge: "Award Winner",
    gradient: "toy-gradient-2",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 2,
    name: "Magnetic Letters",
    image: "https://thetypesetco.com/cdn/shop/files/3E8CB307-B8BC-4615-8A28-101624BA27D4.png?v=1744201649&width=1080",
    description: `Magnetic letters for easy word learning.
    Can be used on boards and fridge surfaces.
    Helps kids practice spelling and vocabulary.
    Encourages word formation skills.
    Bright colors make learning fun.
    Reusable and easy to handle pieces.
    Improves language and reading ability.
    Perfect for home learning.`,
    price: 1800,
    rating: 4.9,
    reviews: 316,
    category: "Educational Toys",
    subcategory: "Learning Kits",
    badge: "Top Rated",
    gradient: "toy-gradient-5",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 3,
    name: "Phonics Learning Cards",
    image: "https://i.pinimg.com/736x/4f/a1/9e/4fa19e65ffc85ff6773598fdf6715e5f.jpg",
    description: `Phonics learning cards help kids identify letter sounds.
    Bright visuals make learning more engaging and fun.
    Supports early reading and speaking development.
    Easy for little hands to hold and use.
    Improves vocabulary and pronunciation skills.
    Great learning support for preschool children.`,
    price: 1399,
    rating: 4.7,
    reviews: 142,
    category: "Educational Toys",
    subcategory: "Learning Kits",
    badge: "Early Learning",
    gradient: "toy-gradient-3",
    ageGroup: ["3-5"],
  },
  {
    id: 4,
    name: "Word Builder Kit",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSeYbnBTh8n4zLk3_kfj0Z3OMHH88j4O8WHMw&s",
    description: `Interactive word builder kit for spelling practice.
    Helps children form simple and meaningful words.
    Encourages independent learning through play.
    Colourful pieces keep kids focused longer.
    Improves reading confidence and language growth.
    Perfect for home and classroom activities.`,
    price: 1599,
    rating: 4.8,
    reviews: 168,
    category: "Educational Toys",
    subcategory: "Learning Kits",
    badge: "Top Pick",
    gradient: "toy-gradient-6",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 5,
    name: "Number Flash Card Set",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRK8Iulnk6WacJ9Uqi-SDOl5dD578QhDAvB9A&s",
    description: `Flash cards designed for number learning and counting.
    Helps kids recognise numbers quickly and easily.
    Great for memory-building and daily revision.
    Lightweight cards are easy to carry anywhere.
    Bright visuals attract children instantly.
    Useful for early maths practice at home.`,
    price: 999,
    rating: 4.6,
    reviews: 111,
    category: "Educational Toys",
    subcategory: "Learning Kits",
    badge: null,
    gradient: "toy-gradient-1",
    ageGroup: ["3-5"],
  },
  {
    id: 6,
    name: "Sight Words Kit",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxkJoSTPjJkRqFcsmN2EsNAmFaXPNiNi_IuA&s",
    description: `Sight words kit helps kids read common words faster.
    Repetition-based learning improves reading fluency.
    Easy-to-use cards support self-paced learning.
    Great for preschool and primary children.
    Encourages strong early literacy development.
    A useful learning tool for everyday practice.`,
    price: 1499,
    rating: 4.7,
    reviews: 126,
    category: "Educational Toys",
    subcategory: "Learning Kits",
    badge: "Reading Boost",
    gradient: "toy-gradient-4",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 7,
    name: "Colour Matching Kit",
    image: "https://www.smartivity.in/cdn/shop/files/1_1.jpg?v=1748724084",
    description: `Colour matching kit helps children identify shades and tones.
    Bright pieces make learning more visually exciting.
    Improves observation and sorting skills.
    Helps in building colour recognition early.
    Child-friendly design makes handling simple.
    Great for fun-based preschool education.`,
    price: 1199,
    rating: 4.5,
    reviews: 94,
    category: "Educational Toys",
    subcategory: "Learning Kits",
    badge: "Creative Play",
    gradient: "toy-gradient-2",
    ageGroup: ["0-2", "3-5"],
  },
  {
    id: 8,
    name: "Basic Writing Practice Kit",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8w7nbeS4Z-nFvarL95w--xE3qlV26OKAAJw&s",
    description: `Writing practice kit helps children trace letters and numbers.
    Improves pencil control and writing confidence.
    Reusable materials support repeated learning sessions.
    Fun activities keep children engaged longer.
    Helps build strong early handwriting skills.
    Ideal for preschool preparation at home.`,
    price: 1699,
    rating: 4.8,
    reviews: 154,
    category: "Educational Toys",
    subcategory: "Learning Kits",
    badge: "Handwriting Fun",
    gradient: "toy-gradient-5",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 9,
    name: "Memory Learning Box",
    image: "https://kidsbestie.com/cdn/shop/files/memory-game-15-game-cards-and-20-magnetic-game-pieces-metal-box-random-design-will-be-send-kids-bestie-4.png?v=1715973910&width=1080",
    description: `Learning box filled with memory and matching activities.
    Encourages concentration and active thinking.
    Different tasks keep kids interested and challenged.
    Improves recall ability and problem-solving.
    Compact set is easy to store after use.
    A complete activity kit for young learners.`,
    price: 1899,
    rating: 4.7,
    reviews: 137,
    category: "Educational Toys",
    subcategory: "Learning Kits",
    badge: "Brain Boost",
    gradient: "toy-gradient-6",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 10,
    name: "Reading Readiness Kit",
    image: "https://images.kaplanco.com/catalog/jumbo/33160_01.jpg",
    description: `Reading readiness kit builds strong early literacy skills.
    Includes fun activities for letters and sounds.
    Helps children transition into reading with confidence.
    Bright content keeps kids engaged while learning.
    Easy-to-follow exercises support guided practice.
    Ideal for preschool and kindergarten learners.`,
    price: 1799,
    rating: 4.8,
    reviews: 161,
    category: "Educational Toys",
    subcategory: "Learning Kits",
    badge: "Best Seller",
    gradient: "toy-gradient-3",
    ageGroup: ["3-5", "6-8"],
  },

  // PUZZLE GAMES (10)
  {
    id: 11,
    name: "Alphabet Puzzle",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9esSA2Xp9kXnrLgpQsv8cpk2wmkyTP5yrLQ&s",
    description: `Fun alphabet puzzle for letter recognition.
    Helps kids learn A to Z in an engaging way.
    Improves vocabulary and memory skills.
    Encourages problem-solving through play.
    Colorful pieces keep kids interested.
    Enhances hand-eye coordination.
    Safe and durable design for kids.`,
    price: 2000,
    rating: 4.6,
    reviews: 147,
    category: "Educational Toys",
    subcategory: "Puzzle Games",
    badge: "STEM",
    gradient: "toy-gradient-3",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 12,
    name: "Jigsaw World Map Puzzle",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVIu3EoNtAdwHByEYpzNcsUvoWEiJ1JjoMqg&s",
    description: `100-piece jigsaw world map puzzle for geography fun.
    Teaches countries, continents, and capitals.
    Improves patience and concentration in kids.
    Colourful design makes learning geography easy.
    High-quality cardboard pieces for durability.
    Perfect group activity for families.`,
    price: 1299,
    rating: 4.6,
    reviews: 152,
    category: "Educational Toys",
    subcategory: "Puzzle Games",
    badge: null,
    gradient: "toy-gradient-3",
    ageGroup: ["6-8", "8-12"],
  },
  {
    id: 13,
    name: "Animal Matching Puzzle",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaMt_WQ--FeI4477FkIfJJZJf08TsaytsLEQ&s",
    description: `Animal matching puzzle helps kids identify animals easily.
    Colourful pieces keep learning fun and engaging.
    Improves memory, focus, and visual matching.
    Safe design supports worry-free everyday play.
    Great for toddlers and preschool children.
    A playful way to build observation skills.`,
    price: 1199,
    rating: 4.7,
    reviews: 118,
    category: "Educational Toys",
    subcategory: "Puzzle Games",
    badge: "Animal Fun",
    gradient: "toy-gradient-1",
    ageGroup: ["0-2", "3-5"],
  },
  {
    id: 14,
    name: "Number Puzzle Board",
    image: "https://rukmini1.flixcart.com/image/1500/1500/xif0q/learning-toy/e/w/2/wooden-numbers-puzzle-board-toy-educational-and-learning-toy-1-original-imagm6tygueuhuav.jpeg?q=70",
    description: `Number puzzle board helps children learn digits through play.
    Encourages counting and number order recognition.
    Easy-to-grip pieces suit young learners well.
    Improves hand-eye coordination and focus.
    Colourful board keeps children engaged longer.
    A useful puzzle for early maths practice.`,
    price: 1099,
    rating: 4.5,
    reviews: 103,
    category: "Educational Toys",
    subcategory: "Puzzle Games",
    badge: "Math Fun",
    gradient: "toy-gradient-4",
    ageGroup: ["3-5"],
  },
  {
    id: 14,
    name: "Solar System Puzzle",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQkYHHGHrhW922zP3c_EpgcSi3wF6E26qigQ&s",
    description: `Solar system puzzle introduces planets in a fun format.
    Colourful artwork makes space learning exciting.
    Improves concentration and general knowledge.
    Great for curious kids interested in science topics.
    Durable pieces are easy to assemble and store.
    A fun way to explore the wonders of space.`,
    price: 1499,
    rating: 4.8,
    reviews: 173,
    category: "Educational Toys",
    subcategory: "Puzzle Games",
    badge: "Space Fun",
    gradient: "toy-gradient-5",
    ageGroup: ["6-8", "8-12"],
  },
  {
    id: 15,
    name: "Transport Puzzle Set",
    image: "https://www.gillkart.com/cdn/shop/files/53860347413_1223e9ff22_o_d-1000x1000.webp?v=1766225954",
    description: `Transport puzzle set teaches children different vehicle types.
    Bright pieces make learning exciting and simple.
    Helps improve recognition and memory development.
    Easy puzzle shapes are perfect for beginners.
    Strong build supports long-lasting use.
    Great educational play activity for toddlers.`,
    price: 1299,
    rating: 4.6,
    reviews: 109,
    category: "Educational Toys",
    subcategory: "Puzzle Games",
    badge: null,
    gradient: "toy-gradient-2",
    ageGroup: ["0-2", "3-5"],
  },
  {
    id: 16,
    name: "Shapes and Patterns Puzzle",
    image: "https://www.cretto.com/cdn/shop/files/3_2_-min_1024x1024.jpg?v=1754328427",
    description: `Shapes and patterns puzzle teaches logical matching.
    Bright design helps children stay focused.
    Improves shape recognition and visual memory.
    Great activity for quiet independent learning.
    Encourages patience and problem-solving skills.
    A useful puzzle for preschool kids.`,
    price: 1399,
    rating: 4.7,
    reviews: 131,
    category: "Educational Toys",
    subcategory: "Puzzle Games",
    badge: "Smart Play",
    gradient: "toy-gradient-6",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 17,
    name: "Body Parts Puzzle",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuI327XYHwD-ziUGC0Tych362A8ysc5FKvbA&s",
    description: `Body parts puzzle teaches children basic anatomy concepts.
    Helps kids identify and name different body parts.
    Interactive pieces make learning more memorable.
    Improves observation and matching ability.
    Child-friendly design ensures safe handling.
    Great for school and home learning sessions.`,
    price: 1199,
    rating: 4.5,
    reviews: 92,
    category: "Educational Toys",
    subcategory: "Puzzle Games",
    badge: "Kids Learning",
    gradient: "toy-gradient-1",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 18,
    name: "Clock Time Puzzle",
    image: "https://m.media-amazon.com/images/I/71Y8w7n2mAL._AC_UF1000,1000_QL80_.jpg",
    description: `Clock time puzzle helps children learn hours and minutes.
    Movable hands make the concept easier to understand.
    Improves time-reading and logical thinking skills.
    Colourful board keeps children interested.
    Great for practical everyday learning at home.
    A helpful educational toy for growing kids.`,
    price: 1349,
    rating: 4.6,
    reviews: 115,
    category: "Educational Toys",
    subcategory: "Puzzle Games",
    badge: "Daily Skills",
    gradient: "toy-gradient-3",
    ageGroup: ["6-8", "8-12"],
  },
  {
    id:19,
    name: "Memory Match Puzzle",
    image: "https://m.media-amazon.com/images/I/71nH6m4x6eL._AC_UF1000,1000_QL80_.jpg",
    description: `Memory match puzzle sharpens recall and focus skills.
    Fun matching challenge keeps children mentally active.
    Bright picture cards support visual recognition.
    Encourages concentration and patience through play.
    Great for solo or group activity sessions.
    A fun educational toy for brain development.`,
    price: 999,
    rating: 4.7,
    reviews: 126,
    category: "Educational Toys",
    subcategory: "Puzzle Games",
    badge: "Brain Game",
    gradient: "toy-gradient-5",
    ageGroup: ["3-5", "6-8"],
  },

  // STEM TOYS (10)
  {
    id: 20,
    name: "Science Kit",
    image: "https://static.wixstatic.com/media/91210f_fc85cd488d314cf5bbe2798d63105167~mv2.webp/v1/fit/w_500,h_500,q_90/file.webp",
    description: `Exciting science kit with fun experiments.
    Encourages curiosity and discovery in kids.
    Includes safe materials for hands-on learning.
    Helps understand basic science concepts.
    Improves critical thinking skills.
    Engaging activities keep kids active.
    Supports STEM-based education.
    Perfect for young scientists.`,
    price: 1500,
    rating: 4.8,
    reviews: 223,
    category: "Educational Toys",
    subcategory: "STEM Toys",
    badge: "Geography Fun",
    gradient: "toy-gradient-4",
    ageGroup: ["6-8", "8-12"],
  },
  {
    id:21,
    name: "Robotics Coding Kit",
    image: "https://m.media-amazon.com/images/I/81Hxl0N0C3L._AC_UF1000,1000_QL80_.jpg",
    description: `Beginner robotics kit to introduce coding concepts.
    Build and program your own simple robot.
    Develops computational thinking from an early age.
    Step-by-step guide included for easy learning.
    Compatible with popular block-coding platforms.
    Encourages creativity and engineering skills.`,
    price: 3499,
    rating: 4.8,
    reviews: 267,
    category: "Educational Toys",
    subcategory: "STEM Toys",
    badge: "STEM",
    gradient: "toy-gradient-2",
    ageGroup: ["8-12"],
  },
  {
    id: 22,
    name: "Circuit Builder Kit",
    image: "https://m.media-amazon.com/images/I/71D8z6nQXGL._AC_UF1000,1000_QL80_.jpg",
    description: `Circuit builder kit introduces basic electronics safely.
    Helps kids explore wires, switches, and power flow.
    Hands-on experiments make science easy to understand.
    Improves logical thinking and curiosity.
    Great for school projects and home learning.
    A fun way to discover engineering concepts.`,
    price: 2299,
    rating: 4.7,
    reviews: 144,
    category: "Educational Toys",
    subcategory: "STEM Toys",
    badge: "Future Tech",
    gradient: "toy-gradient-6",
    ageGroup: ["6-8", "8-12"],
  },
  {
    id: 23,
    name: "Solar Energy Kit",
    image: "https://m.media-amazon.com/images/I/71QzV9r4qNL._AC_UF1000,1000_QL80_.jpg",
    description: `Solar energy kit teaches renewable power through play.
    Helps kids understand clean energy basics.
    Includes simple activities and easy assembly parts.
    Encourages curiosity about science and environment.
    Great for independent and guided learning.
    Makes STEM education more practical and fun.`,
    price: 2499,
    rating: 4.6,
    reviews: 133,
    category: "Educational Toys",
    subcategory: "STEM Toys",
    badge: "Eco Learning",
    gradient: "toy-gradient-1",
    ageGroup: ["6-8", "8-12"],
  },
  {
    id: 24,
    name: "Microscope Starter Kit",
    image: "https://m.media-amazon.com/images/I/71b4m1qFvPL._AC_UF1000,1000_QL80_.jpg",
    description: `Starter microscope kit for young science explorers.
    Helps children observe tiny objects closely.
    Encourages curiosity and experiment-based learning.
    Easy-to-use design is suitable for beginners.
    Great for home projects and school science fun.
    Supports strong interest in discovery and research.`,
    price: 2899,
    rating: 4.8,
    reviews: 171,
    category: "Educational Toys",
    subcategory: "STEM Toys",
    badge: "Science Fun",
    gradient: "toy-gradient-5",
    ageGroup: ["6-8", "8-12"],
  },
  {
    id: 25,
    name: "Magnet Experiment Kit",
    image: "https://m.media-amazon.com/images/I/71F0m8jLQfL._AC_UF1000,1000_QL80_.jpg",
    description: `Magnet experiment kit teaches attraction and repulsion clearly.
    Includes safe tools for hands-on learning.
    Makes science concepts more visual and memorable.
    Great for kids who enjoy discovery activities.
    Improves questioning and observation skills.
    Turns simple experiments into exciting lessons.`,
    price: 1799,
    rating: 4.5,
    reviews: 102,
    category: "Educational Toys",
    subcategory: "STEM Toys",
    badge: null,
    gradient: "toy-gradient-3",
    ageGroup: ["6-8"],
  },
  {
    id: 26,
    name: "Engineering Builder Set",
    image: "https://m.media-amazon.com/images/I/81u6b0gRukL._AC_UF1000,1000_QL80_.jpg",
    description: `Builder set helps children understand basic engineering ideas.
    Includes parts to create simple working models.
    Strengthens planning, creativity, and practical thinking.
    Great for collaborative or solo construction play.
    Durable materials support repeated use.
    A smart toy for future inventors.`,
    price: 2699,
    rating: 4.7,
    reviews: 156,
    category: "Educational Toys",
    subcategory: "STEM Toys",
    badge: "Builder Set",
    gradient: "toy-gradient-4",
    ageGroup: ["6-8", "8-12"],
  },
  {
    id: 27,
    name: "Volcano Experiment Kit",
    image: "https://m.media-amazon.com/images/I/71iP3j2hALL._AC_UF1000,1000_QL80_.jpg",
    description: `Volcano experiment kit makes science dramatic and fun.
    Helps children learn reactions through exciting activity.
    Safe components support guided hands-on exploration.
    Great for improving curiosity and observation.
    Fun setup keeps kids engaged longer.
    Ideal for science fair and home experiments.`,
    price: 1999,
    rating: 4.6,
    reviews: 121,
    category: "Educational Toys",
    subcategory: "STEM Toys",
    badge: "Experiment Fun",
    gradient: "toy-gradient-2",
    ageGroup: ["6-8", "8-12"],
  },
  {
    id:28,
    name: "Space Explorer Kit",
    image: "https://m.media-amazon.com/images/I/71lQ9m8A4AL._AC_UF1000,1000_QL80_.jpg",
    description: `Space explorer kit introduces kids to astronomy basics.
    Includes fun activities related to planets and stars.
    Encourages curiosity about the universe and science.
    Great for hands-on themed learning sessions.
    Improves knowledge through play-based discovery.
    Perfect for children who love space topics.`,
    price: 2399,
    rating: 4.7,
    reviews: 148,
    category: "Educational Toys",
    subcategory: "STEM Toys",
    badge: "Space Learning",
    gradient: "toy-gradient-6",
    ageGroup: ["6-8", "8-12"],
  },
  {
    id:29,
    name: "Coding Logic Board",
    image: "https://m.media-amazon.com/images/I/71o8rN4J4-L._AC_UF1000,1000_QL80_.jpg",
    description: `Coding logic board introduces sequence and command thinking.
    Helps kids understand basic coding concepts visually.
    Improves logical reasoning and problem-solving ability.
    Interactive format makes learning less intimidating.
    Great for future tech learners and beginners.
    A playful entry into coding education.`,
    price: 2599,
    rating: 4.8,
    reviews: 167,
    category: "Educational Toys",
    subcategory: "STEM Toys",
    badge: "Coding Fun",
    gradient: "toy-gradient-1",
    ageGroup: ["6-8", "8-12"],
  },

  // MONTESSORI TOYS (10)
  {
    id: 30,
    name: "Shape Sorting Cube",
    image: "https://us.bababooandfriends.com/cdn/shop/products/KB110041_ShapeSorterCube_Life_P02LowRes.jpg?v=1734445926&width=1080",
    description: `Interactive cube for learning shapes and colors.
    Helps improve sorting and matching skills.
    Enhances hand-eye coordination.
    Encourages logical thinking development.
    Bright design keeps kids engaged.
    Safe and sturdy construction.
    Boosts early cognitive skills.
    Ideal toy for toddlers.`,
    price: 2000,
    rating: 4.7,
    reviews: 188,
    category: "Educational Toys",
    subcategory: "Montessori Toys",
    badge: "Future Tech",
    gradient: "toy-gradient-6",
    ageGroup: ["0-2", "3-5"],
  },
  {
    id: 31,
    name: "Counting Beads Abacus",
    image: "https://bluebellstoys.com/wp-content/uploads/2024/06/Abacus-3-12.webp",
    description: `Classic abacus for learning numbers and counting.
    Helps kids understand addition and patterns.
    Builds strong math fundamentals early.
    Easy-to-use sliding bead design.
    Improves focus and concentration.
    Enhances logical thinking skills.
    Durable and safe for daily use.
    Perfect educational tool for kids.`,
    price: 1700,
    rating: 4.5,
    reviews: 104,
    category: "Educational Toys",
    subcategory: "Montessori Toys",
    gradient: "toy-gradient-1",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 32,
    name: "Montessori Busy Board",
    image: "https://m.media-amazon.com/images/I/71t8V6mH0eL._AC_UF1000,1000_QL80_.jpg",
    description: `Busy board offers hands-on sensory learning for toddlers.
    Includes switches, zips, locks, and buttons.
    Helps improve fine motor and daily life skills.
    Encourages independent exploration and focus.
    Durable design supports repeated everyday use.
    A practical toy for curious little learners.`,
    price: 1899,
    rating: 4.8,
    reviews: 172,
    category: "Educational Toys",
    subcategory: "Montessori Toys",
    badge: "Skill Builder",
    gradient: "toy-gradient-4",
    ageGroup: ["0-2", "3-5"],
  },
  {
    id: 33,
    name: "Stacking Cups Set",
    image: "https://m.media-amazon.com/images/I/71z6m4jV4BL._AC_UF1000,1000_QL80_.jpg",
    description: `Colourful stacking cups help toddlers learn size order.
    Great for sorting, stacking, and balancing games.
    Improves hand-eye coordination and fine motor skills.
    Lightweight pieces are easy to handle.
    Supports early learning through simple play.
    Perfect for independent activity time.`,
    price: 899,
    rating: 4.6,
    reviews: 119,
    category: "Educational Toys",
    subcategory: "Montessori Toys",
    badge: null,
    gradient: "toy-gradient-2",
    ageGroup: ["0-2"],
  },
  {
    id: 34,
    name: "Wooden Lacing Beads",
    image: "https://m.media-amazon.com/images/I/71i7W4xVYxL._AC_UF1000,1000_QL80_.jpg",
    description: `Lacing beads toy strengthens finger control and coordination.
    Kids can thread colourful beads through laces easily.
    Encourages patience, focus, and pattern creation.
    Bright shapes keep children interested longer.
    Great for developing fine motor precision.
    A useful Montessori-style activity toy.`,
    price: 1199,
    rating: 4.7,
    reviews: 137,
    category: "Educational Toys",
    subcategory: "Montessori Toys",
    badge: "Fine Motor",
    gradient: "toy-gradient-5",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 35,
    name: "Colour Sorting Tray",
    image: "https://m.media-amazon.com/images/I/71r5L7jK8xL._AC_UF1000,1000_QL80_.jpg",
    description: `Sorting tray helps kids group colours and objects correctly.
    Supports visual discrimination and concentration skills.
    Easy setup makes learning simple and fun.
    Encourages independent play and problem-solving.
    Bright pieces keep toddlers engaged.
    Useful for early classroom and home learning.`,
    price: 1299,
    rating: 4.5,
    reviews: 98,
    category: "Educational Toys",
    subcategory: "Montessori Toys",
    badge: "Sorting Fun",
    gradient: "toy-gradient-3",
    ageGroup: ["0-2", "3-5"],
  },
  {
    id: 36,
    name: "Practical Life Dressing Frame",
    image: "https://m.media-amazon.com/images/I/71Yp0m4v5uL._AC_UF1000,1000_QL80_.jpg",
    description: `Dressing frame helps kids learn buttons and zippers.
    Builds self-care and independent dressing skills.
    Easy practice makes daily routines less difficult.
    Strong frame supports long-term use.
    Encourages concentration and real-life learning.
    A practical Montessori toy for toddlers.`,
    price: 1599,
    rating: 4.6,
    reviews: 107,
    category: "Educational Toys",
    subcategory: "Montessori Toys",
    badge: "Life Skills",
    gradient: "toy-gradient-6",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 37,
    name: "Object Permanence Box",
    image: "https://m.media-amazon.com/images/I/71bQ6v7v8KL._AC_UF1000,1000_QL80_.jpg",
    description: `Object permanence box teaches cause and effect clearly.
    Helps babies understand how objects reappear again.
    Smooth design makes handling safe and easy.
    Encourages curiosity and repeated exploration.
    Supports cognitive growth during early years.
    A classic Montessori concept made playful.`,
    price: 1399,
    rating: 4.7,
    reviews: 113,
    category: "Educational Toys",
    subcategory: "Montessori Toys",
    badge: "Toddler Pick",
    gradient: "toy-gradient-1",
    ageGroup: ["0-2"],
  },
  {
    id: 38,
    name: "Peg Board Activity Toy",
    image: "https://m.media-amazon.com/images/I/71D7k5hP0SL._AC_UF1000,1000_QL80_.jpg",
    description: `Peg board toy supports fine motor and matching skills.
    Colourful pegs make activity time more exciting.
    Kids can sort, place, and pattern pieces easily.
    Builds focus and visual coordination.
    Durable board is made for repeated practice.
    Great for Montessori-inspired early learning.`,
    price: 1499,
    rating: 4.6,
    reviews: 121,
    category: "Educational Toys",
    subcategory: "Montessori Toys",
    badge: "Pattern Play",
    gradient: "toy-gradient-5",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 39,
    name: "Montessori Sensory Bin Set",
    image: "https://m.media-amazon.com/images/I/71s4m9jQ2UL._AC_UF1000,1000_QL80_.jpg",
    description: `Sensory bin set encourages texture-based learning and discovery.
    Helps toddlers explore touch, colour, and sorting.
    Supports calm play and focused activity sessions.
    Great for sensory development and curiosity.
    Easy-to-use pieces suit little hands well.
    A playful Montessori learning experience.`,
    price: 1799,
    rating: 4.8,
    reviews: 146,
    category: "Educational Toys",
    subcategory: "Montessori Toys",
    badge: "Sensory Play",
    gradient: "toy-gradient-2",
    ageGroup: ["0-2", "3-5"],
  },
];

export default educationalToys;