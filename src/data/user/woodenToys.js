const woodenToys = [
  // WOODEN BLOCKS (10)
  {
    id: 1,
    name: "Wooden Building Blocks",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcST9AhjKIogGa2bjcC03eKZBsrjK5c68jKpyA&s",
    description: `Classic wooden building blocks for creative play.
    Made from natural, non-toxic, child-safe wood.
    Smooth edges ensure complete safety for toddlers.
    Helps develop hand-eye coordination and motor skills.
    Bright painted colors spark imagination and creativity.
    Perfect for stacking, sorting, and building towers.
    A timeless toy loved by generations of children.`,
    price: "1299",
    rating: 4.8,
    reviews: 243,
    category: "Wooden Toys",
    subcategory: "Wooden Blocks",
    badge: "Best Seller",
    gradient: "toy-gradient-5",
    ageGroup: ["0-2", "3-5"],
  },
  {
    id: 2,
    name: "Wooden Stacking Rings",
    image: "https://kidsbestie.com/cdn/shop/files/5-shapes-wooden-colorful-shape-sorting-stacking-rings-toys-kids-bestie-2.png?v=1715973872&width=1080",
    description: `Classic ring stacking toy made from natural wood.
    Six colourful rings in different sizes to stack.
    Teaches size sequencing and colour recognition.
    Rounded base wobbles for extra excitement.
    Smooth edges and splinter-free finish guaranteed.
    Compact and easy to carry for travel play.
    A must-have first toy for babies and toddlers.`,
    price: "699",
    rating: 4.4,
    reviews: 74,
    category: "Wooden Toys",
    subcategory: "Wooden Blocks",
    badge: null,
    gradient: "toy-gradient-4",
    ageGroup: ["0-2"],
  },
  {
    id: 3,
    name: "Wooden Rainbow Stacker",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxcXT0QyGoNUrWb1ylRgsrUeFsCLAf-PfqDA&s",
    description: `Colourful wooden rainbow stacker for toddlers.
    Curved pieces inspire creative open-ended play.
    Smooth polished wood is safe for little hands.
    Helps improve balance and hand-eye coordination.
    Great for stacking, nesting, and pretend play.
    Durable finish ensures long-lasting fun.
    A beautiful Montessori-inspired toy for kids.`,
    price: "1199",
    rating: 4.7,
    reviews: 164,
    category: "Wooden Toys",
    subcategory: "Wooden Blocks",
    badge: "Trending",
    gradient: "toy-gradient-3",
    ageGroup: ["0-2", "3-5"],
  },
  {
    id: 4,
    name: "Wooden Cube Tower Set",
    image: "https://thumbs.dreamstime.com/z/children-s-wooden-designer-blocks-different-form-city-towers-buildings-built-constructor-140217633.jpg",
    description: `Set of wooden cubes for stacking and learning.
    Bright printed sides add visual fun for kids.
    Encourages balance, counting, and coordination.
    Safe rounded edges provide extra protection.
    Solid wood pieces feel sturdy and premium.
    Great for solo and parent-child play sessions.
    Helps toddlers build confidence through play.`,
    price: "999",
    rating: 4.6,
    reviews: 121,
    category: "Wooden Toys",
    subcategory: "Wooden Blocks",
    badge: null,
    gradient: "toy-gradient-6",
    ageGroup: ["0-2", "3-5"],
  },
  {
    id: 5,
    name: "Wooden Domino Blocks",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1logwUNVqw5QyQqEBW7qXPeWxl5QXsSi2nA&s",
    description: `Fun wooden domino blocks for chain reaction play.
    Vibrant colours attract kids instantly.
    Improves patience, planning, and creativity.
    Made from child-safe painted wooden pieces.
    Smooth finish makes every block easy to handle.
    Great for individual and group activities.
    Turns simple stacking into exciting playtime.`,
    price: "899",
    rating: 4.5,
    reviews: 106,
    category: "Wooden Toys",
    subcategory: "Wooden Blocks",
    badge: "Fun Pick",
    gradient: "toy-gradient-2",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 6,
    name: "Wooden City Block Set",
    image: "https://popupkids.in/cdn/shop/products/WoodenCityBuildingBlocks_1_1024x1024.jpg?v=1638421847",
    description: `City-themed wooden block set for imaginative builders.
    Includes houses, trees, and road-style blocks.
    Encourages role play and storytelling skills.
    Smooth wooden finish feels safe and premium.
    Easy to stack, arrange, and rebuild.
    Supports creative thinking during play.
    Perfect gift for little architects.`,
    price: "1599",
    rating: 4.8,
    reviews: 143,
    category: "Wooden Toys",
    subcategory: "Wooden Blocks",
    badge: "Popular",
    gradient: "toy-gradient-1",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 7,
    name: "Wooden Pattern Blocks",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR39Nc43naiQpv75Yy55E8KjpJO-LT6JNfwBw&s",
    description: `Pattern blocks help kids create shapes and designs.
    Comes with multiple colourful geometric pieces.
    Teaches shape recognition and visual thinking.
    Made from smooth and durable natural wood.
    Perfect for independent learning and fun.
    Helps strengthen focus and motor skills.
    A smart educational toy for growing minds.`,
    price: "1099",
    rating: 4.7,
    reviews: 132,
    category: "Wooden Toys",
    subcategory: "Wooden Blocks",
    badge: null,
    gradient: "toy-gradient-5",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 8,
    name: "Wooden Animal Stacker",
    image: "https://m.media-amazon.com/images/I/71ME2CaU+bL._AC_UF1000,1000_QL80_.jpg",
    description: `Cute animal-themed wooden stacker for toddlers.
    Features bright animal pieces for playful stacking.
    Helps children develop balance and coordination.
    Safe smooth wood prevents rough edges.
    Lightweight design suits small hands perfectly.
    Encourages creative and sensory play.
    A joyful toy for early development.`,
    price: "949",
    rating: 4.6,
    reviews: 114,
    category: "Wooden Toys",
    subcategory: "Wooden Blocks",
    badge: "Kid Favorite",
    gradient: "toy-gradient-4",
    ageGroup: ["0-2", "3-5"],
  },
  {
    id: 9,
    name: "Wooden Tower Tumbling Game",
    image: "https://m.media-amazon.com/images/I/71O+FL9SJtL.jpg",
    description: `Classic wooden tumbling tower game for all ages.
    Smooth blocks stack neatly for exciting gameplay.
    Helps build concentration and steady hand control.
    Made from durable polished natural wood.
    Great for family game time and parties.
    Compact design makes storage easy.
    Adds fun challenge to everyday play.`,
    price: "1199",
    rating: 4.8,
    reviews: 185,
    category: "Wooden Toys",
    subcategory: "Wooden Blocks",
    badge: "Game Night",
    gradient: "toy-gradient-6",
    ageGroup: ["6-8", "8-12"],
  },
  {
    id: 10,
    name: "Wooden Nesting Blocks",
    image: "https://images.ctfassets.net/50gzycvace50/a421f40059ddec5934b5fc063c7e4f4f282b5cdf65d1f31bcb4574e240816dc8/e59456a04dbc506d28e11c0b5165b87a/a421f40059ddec5934b5fc063c7e4f4f282b5cdf65d1f31bcb4574e240816dc8.png?fl=progressive&fm=jpg&bg=rgb:fafafa&w=1240&h=1240",
    description: `Wooden nesting blocks for sorting and stacking fun.
    Different sizes help kids understand sequencing.
    Bright artwork keeps little ones engaged.
    Smooth wooden build ensures safe handling.
    Can be stacked high or nested inside each other.
    Supports problem-solving and coordination skills.
    A great early learning toy for toddlers.`,
    price: "1299",
    rating: 4.7,
    reviews: 149,
    category: "Wooden Toys",
    subcategory: "Wooden Blocks",
    badge: null,
    gradient: "toy-gradient-3",
    ageGroup: ["0-2", "3-5"],
  },

  // WOODEN PUZZLES (10)
  {
    id: 11,
    name: "Wooden Shape Sorter",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJtMFl4QnM6R1BzxFt1MhS17DEH2h6sceq5g&s",
    description: `Fun wooden shape sorter for early learners.
    Teaches kids to identify shapes and colours.
    Made from durable solid wood with smooth finish.
    Compact design easy for little hands to hold.
    Encourages problem-solving from a young age.
    Non-toxic paint safe for babies and toddlers.
    Ideal first toy for cognitive development.`,
    price: "999",
    rating: 4.7,
    reviews: 187,
    category: "Wooden Toys",
    subcategory: "Wooden Puzzles",
    badge: "Top Rated",
    gradient: "toy-gradient-6",
    ageGroup: ["0-2", "3-5"],
  },
  {
    id: 12,
    name: "Wooden Puzzle Animals",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6SRJHkK-L1Beq8wUchAhw7DvOHs2GSaY4-g&s",
    description: `Colourful wooden animal puzzle for young minds.
    Features farm animals in bright painted colours.
    Each piece has a knob for easy gripping.
    Builds fine motor skills and shape recognition.
    Made from thick, durable plywood for long use.
    Safe, non-toxic paint meets international standards.
    Great activity for quiet independent play time.`,
    price: "749",
    rating: 4.5,
    reviews: 98,
    category: "Wooden Toys",
    subcategory: "Wooden Puzzles",
    badge: null,
    gradient: "toy-gradient-3",
    ageGroup: ["0-2", "3-5"],
  },
  {
    id: 13,
    name: "Wooden Farm Puzzle",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmkEWOVemp0ejG5saXZ3Bsxni-jTgr29ovWA&s",
    description: `Farm-themed wooden puzzle with colourful pieces.
    Introduces kids to animals and rural scenes.
    Knobbed pieces are easy for toddlers to lift.
    Boosts matching and observation skills.
    Thick wooden board ensures long-lasting use.
    Safe paint makes it child-friendly throughout.
    Great for fun and early learning together.`,
    price: "799",
    rating: 4.6,
    reviews: 102,
    category: "Wooden Toys",
    subcategory: "Wooden Puzzles",
    badge: "Learning Pick",
    gradient: "toy-gradient-2",
    ageGroup: ["0-2", "3-5"],
  },
  {
    id: 14,
    name: "Wooden Fruit Puzzle",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlkqEbN74KmzlRSPbvgLzbWtbM0wqpmtva8A&s",
    description: `Bright fruit puzzle helps kids learn healthy foods.
    Each fruit piece fits into a matching slot.
    Improves shape recognition and hand control.
    Smooth wood feels safe and durable.
    Vibrant colours keep children engaged longer.
    Great for quiet play and early education.
    A cheerful puzzle for little learners.`,
    price: "699",
    rating: 4.5,
    reviews: 81,
    category: "Wooden Toys",
    subcategory: "Wooden Puzzles",
    badge: null,
    gradient: "toy-gradient-5",
    ageGroup: ["0-2", "3-5"],
  },
  {
    id: 15,
    name: "Wooden Vehicle Puzzle",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTK0_baDn9EcFlMEDAjOLyhbpFBq-F9DuLMfg&s",
    description: `Vehicle-themed wooden puzzle for curious kids.
    Features car, bus, train, and other fun shapes.
    Easy-grip pieces are ideal for toddlers.
    Helps improve memory and matching skills.
    Strong wooden board supports daily use.
    Safe smooth finish protects little hands.
    Fun way to learn about transport.`,
    price: "849",
    rating: 4.6,
    reviews: 93,
    category: "Wooden Toys",
    subcategory: "Wooden Puzzles",
    badge: "Top Pick",
    gradient: "toy-gradient-1",
    ageGroup: ["0-2", "3-5"],
  },
  {
    id: 16,
    name: "Wooden Sea Animals Puzzle",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTW19dmls2eW54QiLHXpyNcB86DDq-wWprD7w&s",
    description: `Sea animal puzzle with bright ocean characters.
    Helps kids discover underwater creatures through play.
    Chunky wooden pieces are easy to hold.
    Encourages visual matching and motor skill growth.
    Painted with child-safe non-toxic colours.
    Durable board stands up to regular play.
    A fun marine adventure for toddlers.`,
    price: "799",
    rating: 4.7,
    reviews: 108,
    category: "Wooden Toys",
    subcategory: "Wooden Puzzles",
    badge: "Trending",
    gradient: "toy-gradient-4",
    ageGroup: ["0-2", "3-5"],
  },
  {
    id: 17,
    name: "Wooden Knob Puzzle Letters",
    image: "https://m.media-amazon.com/images/I/71sD9kHxiSL._AC_UF1000,1000_QL80_.jpg",
    description: `Letter puzzle with wooden knobs for easy gripping.
    Introduces alphabets in a hands-on way.
    Helps improve finger control and focus.
    Durable board with smooth edges ensures safety.
    Bright colours make learning more attractive.
    Great tool for preschool learning at home.
    Makes early literacy playful and simple.`,
    price: "949",
    rating: 4.8,
    reviews: 126,
    category: "Wooden Toys",
    subcategory: "Wooden Puzzles",
    badge: "Educational",
    gradient: "toy-gradient-6",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 18,
    name: "Wooden Map Puzzle",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRLq8p6MkM0Kka7KB-0szowALnvRIDV2usag&s",
    description: `Map-style wooden puzzle for curious young learners.
    Helps children identify regions and shapes.
    Smooth puzzle pieces are safe to handle.
    Supports geography awareness in a fun format.
    Durable wood offers a premium feel.
    Great for older toddlers and preschoolers.
    Combines education with hands-on play.`,
    price: "1199",
    rating: 4.7,
    reviews: 117,
    category: "Wooden Toys",
    subcategory: "Wooden Puzzles",
    badge: "Smart Choice",
    gradient: "toy-gradient-3",
    ageGroup: ["6-8", "8-12"],
  },
  {
    id: 19,
    name: "Wooden Number Peg Puzzle",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0LVzX7tJVGIW-2BvWPTtY1AXDY1dM6K1tkA&s",
    description: `Peg puzzle with numbers for early counting practice.
    Raised pieces help toddlers pick them easily.
    Teaches numbers and matching skills together.
    Child-safe paint adds bright visual appeal.
    Thick wooden board is sturdy and durable.
    Excellent for preschool learning sessions.
    Keeps kids engaged in simple number fun.`,
    price: "799",
    rating: 4.6,
    reviews: 88,
    category: "Wooden Toys",
    subcategory: "Wooden Puzzles",
    badge: null,
    gradient: "toy-gradient-2",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 20,
    name: "Wooden Jungle Puzzle",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbHNCstBpLunnkSSz00DGnuT2mhTv0UJ1bcQ&s",
    description: `Jungle-themed puzzle filled with fun animal shapes.
    Helps children recognise wild animals while playing.
    Easy-lift pieces support toddler independence.
    Smooth durable wood improves product quality.
    Great for improving memory and matching.
    Vibrant colours make every play session exciting.
    A cheerful toy for growing minds.`,
    price: "899",
    rating: 4.7,
    reviews: 111,
    category: "Wooden Toys",
    subcategory: "Wooden Puzzles",
    badge: "Best Value",
    gradient: "toy-gradient-5",
    ageGroup: ["3-5", "6-8"],
  },

  // WOODEN VEHICLES (10)
  {
    id: 21,
    name: "Wooden Train Set",
    image: "https://toyshine.in/cdn/shop/files/LTJ_22_6_1024x1024@2x.jpg?v=1700555588",
    description: `Charming wooden train set with multiple carriages.
    Magnetic connectors make assembly easy for kids.
    Smooth rolling wheels glide on any flat surface.
    Comes with railway tracks for exciting adventures.
    Made from eco-friendly FSC certified wood.
    Vibrant colour scheme attracts kids instantly.
    Sparks storytelling and imaginative play.`,
    price: "2499",
    rating: 4.9,
    reviews: 312,
    category: "Wooden Toys",
    subcategory: "Wooden Vehicles",
    badge: "New Arrival",
    gradient: "toy-gradient-1",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 22,
    name: "Wooden Toy Car Set",
    image: "https://i.etsystatic.com/26145841/r/il/d7cfaf/3536981077/il_fullxfull.3536981077_6z6g.jpg",
    description: `Set of 4 handcrafted wooden toy cars for kids.
    Smooth rolling wheels for easy pushing and play.
    Made from solid, child-safe painted wood.
    Compact size perfect for little hands to grip.
    Bright colour variety keeps kids engaged.
    Durable build for rough and tumble play.`,
    price: "1099",
    rating: 4.6,
    reviews: 132,
    category: "Wooden Toys",
    subcategory: "Wooden Vehicles",
    badge: null,
    gradient: "toy-gradient-1",
    ageGroup: ["0-2", "3-5"],
  },
  {
    id: 23,
    name: "Wooden Fire Engine",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvP1VInJ0OTnBzbFFvDXRXYpOxlKCe_R9pMQ&s",
    description: `Bright wooden fire engine for rescue role play.
    Smooth wheels roll easily across flat surfaces.
    Made from durable child-safe painted wood.
    Encourages storytelling and imaginative action scenes.
    Easy for small hands to push around.
    Strong construction supports daily play.
    A fun emergency vehicle for kids.`,
    price: "1199",
    rating: 4.7,
    reviews: 96,
    category: "Wooden Toys",
    subcategory: "Wooden Vehicles",
    badge: "Hot Pick",
    gradient: "toy-gradient-4",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 24,
    name: "Wooden Bus Toy",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiWcy8f3loJcsbYCZHX-TE47Tvmd2ewuElLg&s",
    description: `Classic wooden bus toy with smooth rolling wheels.
    Bright design keeps little ones interested.
    Safe rounded corners suit toddlers well.
    Perfect for pretend travel and passenger play.
    Durable solid wood offers long-term use.
    Easy to grip and move during playtime.
    A cheerful addition to any toy collection.`,
    price: "999",
    rating: 4.5,
    reviews: 84,
    category: "Wooden Toys",
    subcategory: "Wooden Vehicles",
    badge: null,
    gradient: "toy-gradient-2",
    ageGroup: ["0-2", "3-5"],
  },
  {
    id: 25,
    name: "Wooden Airplane Toy",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFNmafNizIvHHA12xHYQZ4biV4iytvgakx3Q&s",
    description: `Wooden airplane toy for sky-high imaginative fun.
    Lightweight body is easy for kids to hold.
    Smooth finish feels premium and safe.
    Great for pretend flights and travel adventures.
    Durable build handles active daily play.
    Bright details make the design more exciting.
    Inspires endless creative stories.`,
    price: "1099",
    rating: 4.6,
    reviews: 92,
    category: "Wooden Toys",
    subcategory: "Wooden Vehicles",
    badge: "Travel Fun",
    gradient: "toy-gradient-6",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 26,
    name: "Wooden Tractor Toy",
    image: "https://www.amazon.in/Wooden-Movable-Tractor-Handcrafted-Showpiece/dp/B0GKQCQ8SL",
    description: `Farm-style wooden tractor toy for pretend field work.
    Rolling wheels move smoothly on floors.
    Strong wooden body feels sturdy and durable.
    Helps kids enjoy rural and farm role play.
    Compact shape is easy to push and carry.
    Safe paint and polished wood finish throughout.
    A fun toy for little vehicle lovers.`,
    price: "1149",
    rating: 4.7,
    reviews: 101,
    category: "Wooden Toys",
    subcategory: "Wooden Vehicles",
    badge: "Farm Favorite",
    gradient: "toy-gradient-3",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 27,
    name: "Wooden Dump Truck",
    image: "https://sowpeace.in/cdn/shop/files/sowpeace-wooden-duck-set-artisan-home-decor-accenttabletopsowpeacewood-wdds-wdn-tt-364312.jpg?v=1741833139",
    description: `Wooden dump truck built for pretend construction fun.
    Smooth wheels glide easily during active play.
    Chunky design fits little hands comfortably.
    Durable body supports long-lasting rough use.
    Encourages imaginative building site stories.
    Child-safe finish keeps play worry-free.
    A sturdy toy truck for energetic kids.`,
    price: "1299",
    rating: 4.8,
    reviews: 119,
    category: "Wooden Toys",
    subcategory: "Wooden Vehicles",
    badge: "Best Seller",
    gradient: "toy-gradient-5",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 28,
    name: "Wooden Police Jeep",
    image: "https://m.media-amazon.com/images/I/81ZjpBZp5RL.jpg",
    description: `Police jeep toy for action-packed rescue stories.
    Smooth wooden body feels safe and premium.
    Rolling wheels make movement easy and fun.
    Great for role play and adventure scenes.
    Solid construction improves long-term durability.
    Bright details capture kids' attention quickly.
    A playful vehicle for creative minds.`,
    price: "1199",
    rating: 4.6,
    reviews: 87,
    category: "Wooden Toys",
    subcategory: "Wooden Vehicles",
    badge: null,
    gradient: "toy-gradient-1",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 29,
    name: "Wooden Helicopter Toy",
    image: "https://cgaxisimages.fra1.cdn.digitaloceanspaces.com/2018/10/cgaxis_models_40_13a-copy.jpg",
    description: `Wooden helicopter toy for rescue and flight adventures.
    Smooth rotating propeller adds extra fun.
    Lightweight design makes it easy to carry.
    Child-safe painted wood ensures secure use.
    Durable structure supports repeated play.
    Great for imaginative air rescue missions.
    A unique addition to toy vehicle sets.`,
    price: "1249",
    rating: 4.7,
    reviews: 93,
    category: "Wooden Toys",
    subcategory: "Wooden Vehicles",
    badge: "Unique Pick",
    gradient: "toy-gradient-4",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 30,
    name: "Wooden Race Car",
    image: "https://m.media-amazon.com/images/I/71VzYgxZl2L.jpg",
    description: `Fast-looking wooden race car with sporty design.
    Smooth wheels allow quick rolling fun.
    Strong wooden body suits everyday handling.
    Compact size fits perfectly into small hands.
    Bright colour finish makes it more exciting.
    Inspires speed-themed pretend play.
    A fun toy for young car fans.`,
    price: "999",
    rating: 4.8,
    reviews: 128,
    category: "Wooden Toys",
    subcategory: "Wooden Vehicles",
    badge: "Top Rated",
    gradient: "toy-gradient-2",
    ageGroup: ["3-5", "6-8"],
  },

  // WOODEN LEARNING TOYS (10)
  {
    id: 31,
    name: "Wooden Abacus",
    image: "",
    description: `Classic wooden abacus for counting and maths learning.
    10 rows with colourful beads for fun number practice.
    Sturdy wooden frame with smooth sliding beads.
    Helps children understand numbers from 1 to 100.
    Improves focus, concentration, and patience in kids.
    Lightweight and portable for home and school use.
    A wonderful educational gift for kids aged 3 and above.`,
    price: "849",
    rating: 4.6,
    reviews: 156,
    category: "Wooden Toys",
    subcategory: "Wooden Learning Toys",
    badge: "Educational",
    gradient: "toy-gradient-2",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 32,
    name: "Wooden Xylophone",
    image: "https://sarveda.com/wp-content/uploads/2024/06/Xylophone_Wooden_4.png",
    description: `Mini wooden xylophone for musical little ones.
    Eight coloured bars produce clear, melodious tones.
    Comes with a wooden mallet for easy playing.
    Introduces kids to music and rhythm from early age.
    Made from solid, child-safe wood with vivid colours.
    Lightweight design perfect for toddler hands.
    Encourages creativity and love for music.`,
    price: "1199",
    rating: 4.7,
    reviews: 221,
    category: "Wooden Toys",
    subcategory: "Wooden Learning Toys",
    badge: "Trending",
    gradient: "toy-gradient-5",
    ageGroup: ["0-2", "3-5"],
  },
  {
    id: 33,
    name: "Wooden Alphabet Board",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnDVseRa6pGelFIuPCmmmfWzJHcLsA2yQwkQ&s",
    description: `Wooden alphabet learning board for early literacy.
    All 26 letters in bright colours with picture cues.
    Each letter piece fits into its matching slot.
    Teaches letter recognition and early spelling.
    Made from thick, durable ply with smooth edges.
    Non-toxic, child-safe paints used throughout.
    A perfect learning gift for kids aged 2 to 5.`,
    price: "1499",
    rating: 4.8,
    reviews: 189,
    category: "Wooden Toys",
    subcategory: "Wooden Learning Toys",
    badge: "Award Winner",
    gradient: "toy-gradient-6",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 34,
    name: "Wooden Number Puzzle",
    image: "https://bluebellstoys.com/wp-content/uploads/2025/04/Educational-Learning-Toy-7.webp",
    description: `10-piece wooden number puzzle for early maths.
    Each number piece fits snugly into its slot.
    Teaches number recognition from 1 to 10.
    Knob handles make pieces easy to pick up.
    Made from thick, smooth, child-safe wood.
    Perfect Montessori learning tool at home.`,
    price: "649",
    rating: 4.7,
    reviews: 98,
    category: "Wooden Toys",
    subcategory: "Wooden Learning Toys",
    badge: null,
    gradient: "toy-gradient-2",
    ageGroup: ["3-5"],
  },
  {
    id: 35,
    name: "Wooden Clock Learning Toy",
    image: "https://rukmini1.flixcart.com/image/1500/1500/xif0q/learning-toy/j/j/t/-original-imahk4a4gnrtnrfa.jpeg?q=70",
    description: `Wooden clock toy for learning time concepts.
    Movable hands make practice interactive and fun.
    Bright colours help children stay engaged.
    Teaches numbers, time, and daily routines.
    Smooth finish keeps it safe for kids.
    Durable build supports regular learning sessions.
    A smart tool for early education.`,
    price: "899",
    rating: 4.6,
    reviews: 94,
    category: "Wooden Toys",
    subcategory: "Wooden Learning Toys",
    badge: "Teacher Choice",
    gradient: "toy-gradient-1",
    ageGroup: ["6-8", "8-12"],
  },
  {
    id: 36,
    name: "Wooden Counting Sticks",
    image: "https://m.media-amazon.com/images/I/41wJZRDYh-L._AC_UF1000,1000_QL80_.jpg",
    description: `Counting sticks made from colourful wooden pieces.
    Helps kids learn numbers and basic maths.
    Easy to sort, count, and arrange by colour.
    Strong wooden design lasts through daily use.
    Smooth edges provide safe handling.
    Useful for home learning and preschool practice.
    Makes maths playful and easy to understand.`,
    price: "799",
    rating: 4.5,
    reviews: 82,
    category: "Wooden Toys",
    subcategory: "Wooden Learning Toys",
    badge: null,
    gradient: "toy-gradient-4",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 37,
    name: "Wooden Spelling Board",
    image: "https://m.media-amazon.com/images/I/61wpgJLDEyL._AC_UF1000,1000_QL80_.jpg",
    description: `Spelling board helps children build simple words.
    Wooden letters fit neatly into the board slots.
    Great for improving vocabulary and recognition.
    Bright colours make lessons more interesting.
    Safe wooden construction feels premium and sturdy.
    Encourages hands-on language learning.
    A fun literacy toy for preschoolers.`,
    price: "1299",
    rating: 4.7,
    reviews: 136,
    category: "Wooden Toys",
    subcategory: "Wooden Learning Toys",
    badge: "Popular",
    gradient: "toy-gradient-3",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 38,
    name: "Wooden Math Board",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvMC02BREycaaKG1BNl7dCGikgLCqFkERjHA&s",
    description: `Math learning board with numbers and symbols.
    Helps children practice basic sums through play.
    Wooden pieces are easy to pick and place.
    Supports early problem-solving and number skills.
    Non-toxic finish keeps it safe for kids.
    Great for home learning and activity time.
    Turns maths into an enjoyable activity.`,
    price: "1099",
    rating: 4.8,
    reviews: 142,
    category: "Wooden Toys",
    subcategory: "Wooden Learning Toys",
    badge: "Educational",
    gradient: "toy-gradient-5",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 39,
    name: "Wooden Calendar Board",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNd9aP1x6hOsbeSFu4LrYtyhF0GADnnwRg-Q&s",
    description: `Calendar board helps kids learn days and dates.
    Includes movable markers for weather and seasons.
    Bright design makes routine learning enjoyable.
    Encourages time awareness and observation.
    Strong wooden body ensures lasting durability.
    Safe edges are gentle for little hands.
    Ideal for morning learning routines.`,
    price: "1399",
    rating: 4.7,
    reviews: 118,
    category: "Wooden Toys",
    subcategory: "Wooden Learning Toys",
    badge: "Daily Learning",
    gradient: "toy-gradient-6",
    ageGroup: ["6-8", "8-12"],
  },
  {
    id: 40,
    name: "Wooden Memory Matching Game",
    image: "https://toyshine.in/cdn/shop/products/WT-338_1_480x480@2x.jpg?v=1644820126",
    description: `Wooden memory game with matching picture tiles.
    Helps improve concentration and recall ability.
    Compact pieces are easy for kids to handle.
    Strong wood quality supports repeated play.
    Colourful pictures keep children interested longer.
    Great for solo or family play sessions.
    A playful way to sharpen memory skills.`,
    price: "999",
    rating: 4.8,
    reviews: 151,
    category: "Wooden Toys",
    subcategory: "Wooden Learning Toys",
    badge: "Brain Boost",
    gradient: "toy-gradient-2",
    ageGroup: ["3-5", "6-8"],
  },
];

export default woodenToys;