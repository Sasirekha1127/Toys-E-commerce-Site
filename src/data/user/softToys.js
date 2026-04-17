const softToys = [
  // TEDDY BEARS
  {
    id: 1,
    name: "Teddy Bear",
    image: "https://cdn.bloomsflora.com/uploads/product/bloomsflora/DEC2024/24InchTeddyBear-1734068311632.webp",
    description: `A lovable classic brown teddy bear with an adorable smile.
    Ultra-soft silky fur gives a warm and cozy feel.
    Perfect companion for bedtime stories and naps.
    Lightweight design makes it easy for kids to carry.
    Safe and child-friendly materials used throughout.`,
    price: "2499",
    rating: 4.8,
    reviews: 128,
    category: "Soft Toys",
    subcategory: "Teddy Bears",
    ageGroup: ["0-2", "3-5"],
  },

  // PLUSH ANIMALS
  {
    id: 2,
    name: "Rabbit Plush",
    image: "https://m.media-amazon.com/images/I/61VP9u-+3LL._AC_UF1000,1000_QL80_.jpg",
    description: `Cute rabbit plush with long floppy ears.
    Super soft texture perfect for hugging and cuddling.
    Made with hypoallergenic and safe materials.
    Gentle design suitable for toddlers and kids.
    Brings comfort during sleep and playtime.
    A lovely companion for everyday joy.`,
    price: "1999",
    rating: 4.6,
    reviews: 94,
    category: "Soft Toys",
    subcategory: "Plush Animals",
    ageGroup: ["0-2", "3-5"],
  },
  {
    id: 3,
    name: "Dinosaur Toy",
    image: "https://static.wixstatic.com/media/333417_6485f8c0bb124b9ca50456010639cbba~mv2.jpg",
    description: `Colorful dinosaur plush for fun playtime.
    Soft and safe fabric perfect for kids.
    Encourages creativity and imagination.
    Lightweight and easy to carry anywhere.
    Perfect for both play and bedtime comfort.
    A must-have toy for dinosaur lovers.
    Brings excitement and joy to everyday play.`,
    price: "2799",
    rating: 4.9,
    reviews: 211,
    category: "Soft Toys",
    subcategory: "Plush Animals",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 4,
    name: "Elephant Soft Toy",
    image: "https://m.media-amazon.com/images/I/512qbv+3AfL._AC_UF1000,1000_QL80_.jpg",
    description: `Adorable elephant plush with soft finish.
    Smooth fabric gives a premium feel.
    Perfect for hugs, naps, and comfort.
    Cute design loved by kids instantly.
    Safe stitching and durable quality.
    Great addition to any toy collection.
    Provides comfort and warmth during bedtime.
    An ideal gift for kids who love cute animals.`,
    price: "2199",
    rating: 4.5,
    reviews: 76,
    category: "Soft Toys",
    subcategory: "Plush Animals",
    ageGroup: ["0-2", "3-5"],
  },
  {
    id: 5,
    name: "Lion Plush",
    image: "https://www.ikea.com/in/en/images/products/djungelskog-soft-toy-lion__0710172_pe727375_s5.jpg",
    description: `Friendly lion plush with soft body.
    Designed for cuddles and playtime fun.
    Comfortable and gentle for kids.
    Perfect for storytelling and imagination.
    Strong stitching ensures long durability.
    A playful companion for everyday adventures.
    Encourages creative play and emotional bonding.`,
    price: "3299",
    rating: 4.0,
    reviews: 304,
    category: "Soft Toys",
    subcategory: "Plush Animals",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 6,
    code: "st-006",
    name: "Koala Soft Toy",
    image: "https://images-cdn.ubuy.co.in/64132e2abf062028ce1cf2f1-koala-plush-toy-stuffed-animal-doll.jpg",
    description: `Cute koala plush with fluffy texture.
    Ultra-soft material for maximum comfort.
    Perfect for hugging and relaxing moments.
    Lightweight and easy for kids to carry.
    Safe and kid-friendly design.
    A lovable friend for all-day companionship.
    Great as a bedtime buddy for peaceful sleep.`,
    price: "1899",
    rating: 4.4,
    reviews: 58,
    category: "Soft Toys",
    subcategory: "Plush Animals",
    ageGroup: ["0-2", "3-5"],
  },
  {
    id: 7,
    name: "Panda Plush",
    image: "https://m.media-amazon.com/images/I/81arfNR+-YL.jpg",
    description: `Soft panda plush with a cute black and white look.
    Gentle texture makes it perfect for cuddling.
    Kid-safe materials support everyday play.
    Lightweight build is easy to carry around.
    Great for naps, room décor, and gifting.
    A lovable panda friend for kids.`,
    price: "2099",
    rating: 4.7,
    reviews: 112,
    category: "Soft Toys",
    subcategory: "Plush Animals",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 8,
    name: "Giraffe Plush",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQl5DZQvQW3gRkuSBXxTX8sH3s-FrJ99pkwrQ&s",
    description: `Adorable giraffe plush with a long-neck design.
    Soft body feels cosy and comfortable.
    Great for storytelling and imaginative play.
    Durable stitching improves lasting quality.
    Safe for kids and easy to maintain.
    Makes playtime more colourful and fun.`,
    price: "2299",
    rating: 4.6,
    reviews: 91,
    category: "Soft Toys",
    subcategory: "Plush Animals",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 9,
    name: "Monkey Plush",
    image: "https://www.kheliyatoys.com/wp-content/uploads/2025/08/Just-Bear-Cute-Monkey-with-Little-Banana6-Photoroom.jpg",
    description: `Playful monkey plush with a cheerful face.
    Super soft material is gentle for kids.
    Lightweight design supports easy carrying.
    Ideal for cuddles, play, and display.
    Durable seams help with daily use.
    A fun jungle friend for every child.`,
    price: "1999",
    rating: 4.5,
    reviews: 84,
    category: "Soft Toys",
    subcategory: "Plush Animals",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 10,
    name: "Penguin Plush",
    image: "https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/NI_CATALOG/IMAGES/CIW/2026/3/19/b54a07b2-63a5-4384-a7eb-b0de9ea7b1e7_RA33DQGZOM.jpg",
    description: `Cute penguin plush with a soft rounded body.
    Smooth plush fabric feels cosy and warm.
    Great for bedtime comfort and gentle play.
    Child-friendly materials make it safe to use.
    Compact size fits perfectly in little arms.
    A charming toy for animal lovers.`,
    price: "1899",
    rating: 4.7,
    reviews: 109,
    category: "Soft Toys",
    subcategory: "Plush Animals",
    ageGroup: ["0-2", "3-5"],
  },
  {
    id: 11,
    name: "Fox Plush",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8jG_fPqIvlhj0p7FXMepgp3DE8ER1FLkHvQ&s",
    description: `Soft fox plush with bright charming colours.
    Plush stuffing gives a premium cuddly touch.
    Perfect for playful moments and comfort.
    Safe build is suitable for young children.
    Strong stitching supports regular handling.
    A clever little buddy for toy collections.`,
    price: "2199",
    rating: 4.6,
    reviews: 78,
    category: "Soft Toys",
    subcategory: "Plush Animals",
    ageGroup: ["3-5", "6-8"],
  },

  // CARTOON TOYS
  {
    id: 12,
    name: "Doraemon Cartoon Plush",
    image: "https://rukmini1.flixcart.com/image/1500/1500/xif0q/stuffed-toy/i/p/k/cartoon-doremon-soft-toys-18-jr-jack-rose-original-imahh7p4avznzgft.jpeg?q=70",
    description: `Soft Doraemon cartoon plush loved by all ages.
    Bright blue color with classic character design.
    Super soft and huggable for kids.
    Safe stitching and durable quality throughout.
    Perfect gift for cartoon fans.
    Great companion for playtime and bedtime.`,
    price: "1599",
    rating: 4.7,
    reviews: 143,
    category: "Soft Toys",
    subcategory: "Cartoon Toys",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 13,
    name: "Mickey Mouse Stuffed Toy",
    image: "https://cdn.fynd.com/v2/falling-surf-7c8bb8/fyprod/wrkr/products/pictures/item/free/original/VOPIsSwO1-product.jpeg",
    description: `Classic Mickey Mouse stuffed plush for kids.
    Iconic black-and-red design kids instantly love.
    Soft, lightweight and easy to carry anywhere.
    Safe materials ideal for toddlers and young kids.
    A fan-favourite character gift for every occasion.
    Durable stitching ensures long-lasting use.`,
    price: "1799",
    rating: 4.6,
    reviews: 89,
    category: "Soft Toys",
    subcategory: "Cartoon Toys",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 14,
    name: "Minnie Mouse Plush",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTGxJhNSrGZewNsY1wbIQjuWqc2QB1lBlCJA&s",
    description: `Lovely Minnie Mouse plush with signature bow.
    Soft body is perfect for hugging and cuddling.
    Bright colours make it visually attractive.
    Safe materials are ideal for kids.
    Great gift for Disney fans of all ages.
    Durable design supports long-lasting play.`,
    price: "1849",
    rating: 4.7,
    reviews: 95,
    category: "Soft Toys",
    subcategory: "Cartoon Toys",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 15,
    name: "Pikachu Plush",
    image: "https://rukmini1.flixcart.com/image/1500/1500/xif0q/stuffed-toy/b/u/e/pikachu-soft-toy-for-kids-cute-plush-stuffed-toy-yellow-pok-mon-original-imahegrgd7tpktcy.jpeg?q=70",
    description: `Cute Pikachu plush with bright yellow design.
    Soft filling makes it extra huggable and fun.
    Perfect for Pokémon lovers and collectors.
    Lightweight body is easy for kids to hold.
    Durable quality ensures better long-term use.
    Great for gifting and playful display.`,
    price: "1999",
    rating: 4.8,
    reviews: 162,
    category: "Soft Toys",
    subcategory: "Cartoon Toys",
    ageGroup: ["3-5", "6-8", "8-12"],
  },
  {
    id: 16,
    name: "Shinchan Plush",
    image: "https://rukmini1.flixcart.com/image/1500/1500/xif0q/stuffed-toy/z/r/k/bunny-shinchan-soft-toy-teddy-bear-for-kids-huggable-plush-original-imahgvqcwewhaghx.jpeg?q=70",
    description: `Funny Shinchan plush with a playful expression.
    Soft texture keeps it cuddly and comfortable.
    Cartoon-inspired look is loved by kids.
    Safe stitching improves daily durability.
    Great companion for playtime and naps.
    A cute collectible for cartoon fans.`,
    price: "1699",
    rating: 4.5,
    reviews: 86,
    category: "Soft Toys",
    subcategory: "Cartoon Toys",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 17,
    name: "Tom Cartoon Plush",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3Vn79x4RJhu9Yuy5MLGyDrHhYREhK0bsXlg&s",
    description: `Classic Tom plush inspired by cartoon fun.
    Soft body and charming design delight kids.
    Perfect for cuddles and character collections.
    Child-friendly materials add safe comfort.
    Easy to carry during travel and play.
    Makes cartoon playtime more exciting.`,
    price: "1799",
    rating: 4.4,
    reviews: 71,
    category: "Soft Toys",
    subcategory: "Cartoon Toys",
    ageGroup: ["3-5", "6-8", "8-12"],
  },
  {
    id: 18,
    name: "Jerry Cartoon Plush",
    image: "https://rukmini1.flixcart.com/image/1500/1500/xif0q/stuffed-toy/v/y/o/jerry-plush-doll-soft-cute-stuffed-cartoon-toy-animal-mouse-kids-original-imahffuqbhyr9gcf.jpeg?q=70",
    description: `Cute Jerry plush with a lively cartoon look.
    Soft and smooth fabric feels gentle to touch.
    Great for kids who love classic characters.
    Compact size makes it easy to carry.
    Durable stitching keeps the toy secure.
    A playful addition to any collection.`,
    price: "1699",
    rating: 4.5,
    reviews: 79,
    category: "Soft Toys",
    subcategory: "Cartoon Toys",
    ageGroup: ["3-5", "6-8", "8-12"],
  },
  {
    id: 19,
    name: "Hello Kitty Plush",
    image: "https://m.media-amazon.com/images/I/71NhuW4GS+L._AC_UF1000,1000_QL80_.jpg",
    description: `Adorable Hello Kitty plush with a soft finish.
    Cute design is perfect for gifting and décor.
    Plush stuffing offers a warm cuddly feel.
    Safe and lightweight for younger kids.
    Bright colours make it visually attractive.
    A sweet friend for everyday play.`,
    price: "1899",
    rating: 4.7,
    reviews: 118,
    category: "Soft Toys",
    subcategory: "Cartoon Toys",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 20,
    name: "SpongeBob Plush",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQoNdgFfSd_z_qLPcqotyvOQfYGZcebnzc6Q&s",
    description: `Fun SpongeBob plush with a cheerful smile.
    Soft body offers both comfort and play value.
    Great for cartoon fans and gift occasions.
    Lightweight and easy for kids to handle.
    Durable fabric supports everyday play.
    Adds extra fun to any toy shelf.`,
    price: "1899",
    rating: 4.6,
    reviews: 83,
    category: "Soft Toys",
    subcategory: "Cartoon Toys",
    ageGroup: ["6-8", "8-12"],
  },
  {
    id: 21,
    name: "Pooh Bear Cartoon Plush",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYIInso0Czt0NbWTH6nrMMugeOgyeSUbErqA&s",
    description: `Soft Pooh Bear plush with classic yellow-red style.
    Smooth plush fabric makes it perfect for cuddles.
    Great for bedtime comfort and decoration.
    Safe construction is suitable for kids.
    Attractive cartoon detailing enhances the look.
    A lovable plush for character fans.`,
    price: "1999",
    rating: 4.8,
    reviews: 124,
    category: "Soft Toys",
    subcategory: "Cartoon Toys",
    ageGroup: ["0-2", "3-5"],
  },

  // BABY SOFT TOYS
  {
    id: 22,
    name: "Baby Rattle Plush",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTp09hTQKo7Z2Tl_R8i_T2SIrIq7XqCqMVgJg&s",
    description: `Soft rattle plush for newborns and babies.
    Gentle rattling sound engages baby's senses.
    Ultra-soft, hypoallergenic fabric throughout.
    Safe and BPA-free materials used.
    Vibrant colours stimulate baby's vision.
    Perfect size for tiny baby hands to grip.`,
    price: "699",
    rating: 4.8,
    reviews: 201,
    category: "Soft Toys",
    subcategory: "Baby Soft Toys",
    ageGroup: ["0-2"],
  },
  {
    id: 23,
    name: "Baby Crib Hanging Toy",
    image: "https://media.hunyhuny.com/12757-large_default/baby-cot-mobile-baby-crib-hanging-baby-nursery-decor-baby-toy-elephant.jpg",
    description: `Colourful crib hanging toy for infants.
    Multiple soft characters stimulate visual attention.
    Gentle jingle sound soothes and calms babies.
    Easy to attach to any standard baby crib.
    Made with soft, washable fabric throughout.
    Promotes early sensory development in babies.`,
    price: "899",
    rating: 4.5,
    reviews: 116,
    category: "Soft Toys",
    subcategory: "Baby Soft Toys",
    ageGroup: ["0-2"],
  },
  {
    id: 24,
    name: "Baby Elephant Rattle",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQG1SC38oIXoyC0DNxC7P3t-Kw9Ya1Y0wDgaQ&s",
    description: `Cute elephant rattle plush for little babies.
    Soft body is gentle on delicate hands.
    Light rattling sound keeps babies engaged.
    Safe fabric supports worry-free playtime.
    Easy to hold and shake for fun.
    Helps improve early sensory interaction.`,
    price: "749",
    rating: 4.7,
    reviews: 133,
    category: "Soft Toys",
    subcategory: "Baby Soft Toys",
    ageGroup: ["0-2"],
  },
  {
    id: 25,
    name: "Baby Star Pillow Toy",
    image: "https://m.media-amazon.com/images/I/71p8PP3M0lL._AC_UF1000,1000_QL80_.jpg",
    description: `Soft star-shaped toy pillow for babies.
    Plush material feels gentle and cosy.
    Lightweight form is easy to place anywhere.
    Great for crib comfort and soft play.
    Safe stitching improves durability and quality.
    A cute toy for daily baby use.`,
    price: "799",
    rating: 4.6,
    reviews: 87,
    category: "Soft Toys",
    subcategory: "Baby Soft Toys",
    ageGroup: ["0-2"],
  },
  {
    id: 26,
    name: "Baby Bunny Comfort Toy",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShu1KTHuq0GlxbWJXfFGV6iVN-ORrxmaP9bA&s",
    description: `Soft bunny comfort toy for infants and toddlers.
    Gentle plush texture offers a soothing touch.
    Easy to carry during naps and travel.
    Child-safe materials ensure secure use.
    Cute bunny design attracts little ones.
    Helps babies feel calm and relaxed.`,
    price: "849",
    rating: 4.7,
    reviews: 98,
    category: "Soft Toys",
    subcategory: "Baby Soft Toys",
    ageGroup: ["0-2"],
  },
  {
    id: 27,
    name: "Moon Crib Plush",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3vrIF8cSa8SjuOLyKqmiiMkkvgt-Cj-a7yQ&s",
    description: `Soft moon-shaped crib plush for babies.
    Gentle texture is perfect for early cuddles.
    Designed to add comfort to sleeping spaces.
    Easy to hang or place in the crib.
    Safe fabric supports baby-friendly use.
    Cute moon design creates a calming look.`,
    price: "899",
    rating: 4.5,
    reviews: 69,
    category: "Soft Toys",
    subcategory: "Baby Soft Toys",
    ageGroup: ["0-2"],
  },
  {
    id: 28,
    name: "Baby Cloud Plush",
    image: "https://m.media-amazon.com/images/I/8182JoWkY7L._AC_UF1000,1000_QL80_.jpg",
    description: `Cloud-shaped baby plush with a soft finish.
    Lightweight body feels gentle and cosy.
    Perfect for crib décor and soft play.
    Hypoallergenic fabric suits delicate skin.
    Safe construction supports daily handling.
    A peaceful toy for baby spaces.`,
    price: "799",
    rating: 4.6,
    reviews: 74,
    category: "Soft Toys",
    subcategory: "Baby Soft Toys",
    ageGroup: ["0-2"],
  },
  {
    id: 29,
    name: "Baby Teether Plush",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMS8JP5MQBqbrkMki8UXiFmLtTl7qcir_lmA&s",
    description: `Soft baby plush with attached teether ring.
    Helps babies explore textures safely.
    Gentle fabric keeps it cuddly and soothing.
    Easy-grip shape fits tiny hands well.
    Great for sensory development and play.
    Useful during teething stages.`,
    price: "949",
    rating: 4.8,
    reviews: 121,
    category: "Soft Toys",
    subcategory: "Baby Soft Toys",
    ageGroup: ["0-2"],
  },
  {
    id: 30,
    name: "Infant Sleep Plush",
    image: "https://assets.babycenter.com/ims/2020/06/iStock-519651132_4x3.jpg",
    description: `Sleep plush designed to comfort newborn babies.
    Extra-soft texture feels calm and soothing.
    Perfect for bedtime and quiet play.
    Compact size is easy to keep nearby.
    Safe materials support worry-free usage.
    A sweet companion for restful moments.`,
    price: "899",
    rating: 4.7,
    reviews: 89,
    category: "Soft Toys",
    subcategory: "Baby Soft Toys",
    ageGroup: ["0-2"],
  },
  {
    id: 31,
    name: "Baby Sensory Plush Set",
    image: "https://m.media-amazon.com/images/I/716zkpAstSL.jpg",
    description: `Soft sensory plush set made for baby learning.
    Different textures keep little hands engaged.
    Bright colours support early visual development.
    Gentle sound elements add playful interaction.
    Safe and washable material improves usability.
    Great starter toy for infants and toddlers.`,
    price: "1199",
    rating: 4.8,
    reviews: 147,
    category: "Soft Toys",
    subcategory: "Baby Soft Toys",
    ageGroup: ["0-2"],
  },

  // TEDDY
  {
    id: 11,
    name: "Pink Teddy Bear",
    image: "https://archiesonline.com/cdn/shop/files/8907089827042B_2.jpg?v=1753949161",
    description: `Soft pink teddy bear with a cute bow.
    Premium plush fabric feels smooth and gentle.
    Perfect for hugs, naps, and playful moments.
    Lightweight body is easy for kids to carry.
    Safe stitching ensures long-lasting durability.
    A lovely gift choice for special occasions.`,
    price: "2299",
    rating: 4.7,
    reviews: 102,
    category: "Soft Toys",
    subcategory: "Teddy Bears",
    ageGroup: ["0-2", "3-5"],
  },
  {
    id: 12,
    code: "st-012",
    name: "White Cuddle Teddy",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUqAkNVxKPgTwN6pt7XtL9nY0NCUPVIUoILA&s",
    description: `Adorable white teddy bear made for cuddles.
    Soft fur provides extra comfort during sleep.
    Gentle design makes it suitable for kids.
    Perfect for gifting and room decoration.
    Durable stitching keeps the toy secure.
    A cosy friend for every child.`,
    price: "2599",
    rating: 4.6,
    reviews: 97,
    category: "Soft Toys",
    subcategory: "Teddy Bears",
    ageGroup: ["0-2", "3-5"],
  },
  {
    id: 13,
    code: "st-013",
    name: "Heart Teddy Bear",
    image: "https://luvflowercake.com/wp-content/uploads/2021/09/47092_holding-heart-teddy.jpeg",
    description: `Cute teddy bear holding a soft heart pillow.
    Smooth plush texture feels warm and premium.
    Great for hugs, gifting, and decoration.
    Kid-friendly materials ensure safe everyday play.
    Lightweight design is easy to move around.
    Adds sweetness to any toy collection.`,
    price: "2699",
    rating: 4.8,
    reviews: 144,
    category: "Soft Toys",
    subcategory: "Teddy Bears",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 14,
    code: "st-014",
    name: "Bow Teddy Plush",
    image: "https://m.media-amazon.com/images/I/81BFVOaKJIL.jpg",
    description: `Charming teddy plush with a stylish bow.
    Designed with ultra-soft and fluffy fur.
    Perfect for bedtime cuddles and playtime.
    Safe materials make it ideal for children.
    Strong seams improve durability and quality.
    A sweet gift for teddy lovers.`,
    price: "2399",
    rating: 4.5,
    reviews: 81,
    category: "Soft Toys",
    subcategory: "Teddy Bears",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 15,
    code: "st-015",
    name: "Jumbo Teddy Bear",
    image: "https://media.wallmantra.com/product/other/wallmantra-bow-tie-soft-premium-coffee-brown-big-teddy-bear-available-in-multiple-sizes-2-ft-B930-large.webp",
    description: `Large jumbo teddy bear for extra-big hugs.
    Plush fabric feels soft, smooth, and cosy.
    Perfect for room décor and cuddling.
    Loved by kids for its giant adorable look.
    Durable stitching supports regular use.
    Makes every playtime more comforting and fun.`,
    price: "3999",
    rating: 4.9,
    reviews: 212,
    category: "Soft Toys",
    subcategory: "Teddy Bears",
    ageGroup: ["3-5", "6-8", "8-12"],
  },
  {
    id: 16,
    code: "st-016",
    name: "Mini Pocket Teddy",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6fGuUv6BRGRGdyJv-lyJfRpq8xo2n8bMp_A&s",
    description: `Small pocket teddy bear with cute features.
    Compact size makes it easy to carry anywhere.
    Soft body offers a gentle cuddly feel.
    Perfect for gifting and return gifts.
    Safe design suitable for young children.
    A tiny friend with big charm.`,
    price: "999",
    rating: 4.4,
    reviews: 73,
    category: "Soft Toys",
    subcategory: "Teddy Bears",
    ageGroup: ["0-2", "3-5"],
  },
  {
    id: 17,
    code: "st-017",
    name: "Honey Brown Teddy",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTn5A_fWNg_f6bMSPRLU43rtUeqFTCWznwTjg&s",
    description: `Honey brown teddy bear with a smiling face.
    Soft plush body gives a premium cuddly feel.
    Designed for comfort during naps and rest.
    Lightweight build suits kids of all ages.
    Strong stitching adds everyday durability.
    Brings warmth and joy to playtime.`,
    price: "2199",
    rating: 4.6,
    reviews: 88,
    category: "Soft Toys",
    subcategory: "Teddy Bears",
    ageGroup: ["3-5", "6-8"],
  },
  {
    id: 18,
    code: "st-018",
    name: "Sleepy Teddy Bear",
    image: "https://m.media-amazon.com/images/I/71JSVby8O6L.jpg",
    description: `Sleepy-faced teddy bear made for bedtime comfort.
    Soft fur helps kids feel calm and relaxed.
    Cute sleepy look makes it extra lovable.
    Gentle stuffing gives a fluffy soft touch.
    Safe and kid-friendly construction throughout.
    Ideal bedtime buddy for little ones.`,
    price: "2099",
    rating: 4.7,
    reviews: 92,
    category: "Soft Toys",
    subcategory: "Teddy Bears",
    ageGroup: ["0-2", "3-5"],
  },
  {
    id: 19,
    code: "st-019",
    name: "Classic Gift Teddy",
    image: "https://poojiflowers.com/cdn/shop/files/white-teddy-bear-with-red-heart-plush-gift-kuwait.png?v=1763249139&width=1024",
    description: `Classic teddy bear perfect for gifts and cuddles.
    Crafted with soft plush for daily comfort.
    Timeless design appeals to kids and adults.
    Easy to carry and place anywhere.
    Durable quality supports long-term use.
    A dependable companion for every day.`,
    price: "2499",
    rating: 4.8,
    reviews: 136,
    category: "Soft Toys",
    subcategory: "Teddy Bears",
    ageGroup: ["3-5", "6-8"],
  },
];

export default softToys;