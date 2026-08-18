/**
 * Gramin Bharat TV - Data Store
 * Structured authentic data extracted & curated from graminbharat-tv.com
 */

const GBTV_DATA = {
  brand: {
    name: "Gramin Bharat TV",
    regionalName: "ग्रामीण भारत टीव्ही",
    founder: "Vilas Gadge",
    founderTitle: "Writer, Director & Producer",
    experience: "25+ Years",
    tagline: "The Voice of Rural India & Grassroots Leadership",
    phone: "+91 99872 13141",
    phoneRaw: "+919987213141",
    email: "info@graminbharat-tv.com",
    locations: {
      nagpur: {
        title: "Nagpur Head Office",
        address: "Sneha Apartment, Plot No. 30, Banerjee Layout, Bhagwan Nagar, Nagpur, Maharashtra 440027",
        badge: "Nagpur Office"
      },
      mumbai: {
        title: "Mumbai Production Office",
        address: "Heera Panna Mall, Oshiwara, Andheri West, Mumbai, Maharashtra 400102",
        badge: "Mumbai Office"
      }
    },
    socials: {
      facebook: "https://facebook.com",
      twitter: "https://twitter.com",
      instagram: "https://instagram.com",
      youtube: "https://youtube.com",
      linkedin: "https://linkedin.com"
    }
  },

  stats: [
    { id: "stat-years", count: 25, suffix: "+", label: "Years of Legacy", icon: "fas fa-award" },
    { id: "stat-films", count: 15, suffix: "+", label: "Films & Documentaries", icon: "fas fa-film" },
    { id: "stat-villages", count: 8705, suffix: "+", label: "Active Gram Panchayats", icon: "fas fa-landmark" },
    { id: "stat-viewers", count: 9774, suffix: "+", label: "Happy Viewers & Community", icon: "fas fa-users" }
  ],

  heroSlides: [
    {
      id: 1,
      tag: "BEST FILM MAKER",
      tagIcon: "fas fa-angle-double-right",
      title: "<span class='hero-orange-text'>Gramin Bharat</span> <br><span class='hero-white-text'>TV</span>",
      description: "Vilas Gadge is a writer, director, and producer with over 25 years of experience in the film industry. He has written, directed, and produced more than 15 films and documentaries. Working extensively across villages in Maharashtra, he has closely engaged with grassroots realities and rural life.",
      videoId: "F8mTudf-KiY",
      videoTitle: "Watch Video",
      bgImage: "assets/fsdg.jpg",
      ctaText: "GET STARTED",
      ctaPage: "about"
    },
    {
      id: 2,
      tag: "SHRUTI FILMS PRASTUT",
      tagIcon: "fas fa-award",
      title: "<span class='hero-orange-text'>Namdar</span> <br><span class='hero-white-text'>Maharashtracha</span>",
      description: "A flagship television and digital show honoring visionary Sarpanchs and rural development leaders who are transforming village infrastructure, education, and farming communities across Maharashtra.",
      videoId: "uvjd2uM57Is",
      videoTitle: "Watch Episode",
      bgImage: "assets/hero_slide_1.jpg",
      ctaText: "EXPLORE SHOW",
      ctaPage: "namdar"
    },
    {
      id: 3,
      tag: "GRASSROOTS AWARENESS",
      tagIcon: "fas fa-bullhorn",
      title: "<span class='hero-orange-text'>Mission</span> <br><span class='hero-white-text'>Janjagruti</span>",
      description: "The starting of a web channel and on-ground outreach program which reaches to the very villages of Maharashtra to cover news specially for farmers, rural youth, and village development.",
      videoId: "bMxLDTpJJ9o",
      videoTitle: "Watch Story",
      bgImage: "https://graminbharat-tv.com/wp-content/uploads/2026/01/fdgg.png",
      ctaText: "OUR WORKS",
      ctaPage: "works"
    }
  ],

  namdarEpisodes: [
    {
      id: 1,
      title: "गाव ते नेतृत्व – सरपंचांचा सन्मान (भाग १)",
      shortTitle: "गाव ते नेतृत्व",
      series: "Namdar Maharashtracha",
      category: "Gram Panchayat Leadership",
      description: "ग्रामपंचायत स्तरावर विशेष कार्यक्रम आणि गावासाठी अहोरात्र झटणाऱ्या आदर्श सरपंचांचा सन्मान सोहळा.",
      points: [
        "ग्रामपंचायत स्तरावर विशेष संवाद व सत्कार",
        "गावासाठी झटणाऱ्या सरपंचांचा गौरव",
        "ग्रामीण विकास मॉडेल्सचे सादरीकरण"
      ],
      videoId: "F8mTudf-KiY",
      thumbnail: "https://graminbharat-tv.com/wp-content/uploads/2026/01/dsfdsg.jpg",
      duration: "24 Min"
    },
    {
      id: 2,
      title: "आदर्श गाव संकल्पना व जलसंधारण मोहीम (भाग २)",
      shortTitle: "आदर्श गाव",
      series: "Namdar Maharashtracha",
      category: "Rural Transformation",
      description: "गावातील शेती, पाणी प्रश्न आणि सौर ऊर्जेवर यशस्वी काम करणाऱ्या ग्राम प्रतिनिधींशी संवाद.",
      points: [
        "जलसंधारण आणि शेती तंत्रज्ञान",
        "स्थानिक रोजगार आणि महिला बचत गट",
        "स्वच्छ व डिजिटल ग्रामपंचायत मोहीम"
      ],
      videoId: "uvjd2uM57Is",
      thumbnail: "https://graminbharat-tv.com/wp-content/uploads/2026/01/fsddsf.jpg",
      duration: "28 Min"
    },
    {
      id: 3,
      title: "शिक्षण, आरोग्य व युवा सक्षमीकरण (भाग ३)",
      shortTitle: "युवा सक्षमीकरण",
      series: "Namdar Maharashtracha",
      category: "Community Impact",
      description: "ग्रामीण भागातील शाळा, आरोग्य केंद्रे व तरुण पिढीसाठी राबवलेले नाविन्यपूर्ण उपक्रम.",
      points: [
        "डिजिटल प्राथमिक शाळा उपक्रम",
        "आरोग्य शिबिरे व जनजागृती",
        "युवा क्रीडा व कौशल्य विकास"
      ],
      videoId: "gfwEQ-UA5vI",
      thumbnail: "https://graminbharat-tv.com/wp-content/uploads/2026/01/sfdg.jpg",
      duration: "26 Min"
    }
  ],

  streamingShows: [
    {
      id: "str-1",
      title: "सरपंच संवाद - ग्रामीण महाराष्ट्राचा विकास",
      showName: "Namdar Maharashtracha",
      category: "leadership",
      videoId: "I2lHUtkIfNM",
      image: "https://graminbharat-tv.com/wp-content/uploads/2026/01/WhatsApp-Image-2025-12-30-at-12.55.01-PM.jpeg",
      views: "142K views",
      duration: "32 Min",
      quality: "4K UHD",
      progress: "80%",
      badge: "🔥 TRENDING"
    },
    {
      id: "str-2",
      title: "शेतकरी संघर्ष आणि यशोगाथा",
      showName: "Mission Janjagruti",
      category: "documentary",
      videoId: "d9MyW72ELq0",
      image: "https://graminbharat-tv.com/wp-content/uploads/2026/01/WhatsApp-Image-2025-12-30-at-12.55.02-PM.jpeg",
      views: "98K views",
      duration: "24 Min",
      quality: "1080P HD",
      progress: "65%",
      badge: "🌾 POPULAR"
    },
    {
      id: "str-3",
      title: "विलास गाडगे दिग्दर्शित सामाजिक लघुपट",
      showName: "Special Screening",
      category: "cinema",
      videoId: "pMVpvyoamnk",
      image: "https://graminbharat-tv.com/wp-content/uploads/2026/01/WhatsApp-Image-2025-12-31-at-4.49.00-PM.jpeg",
      views: "75K views",
      duration: "18 Min",
      quality: "4K UHD",
      progress: "45%",
      badge: "🎬 CINEMA"
    },
    {
      id: "str-4",
      title: "गावातील क्रांती - महिला नेतृत्व",
      showName: "Namdar Maharashtracha",
      category: "leadership",
      videoId: "7FiFYH9TpPo",
      image: "https://graminbharat-tv.com/wp-content/uploads/2026/01/WhatsApp-Image-2025-12-31-at-4.48.58-PM-1.jpeg",
      views: "110K views",
      duration: "26 Min",
      quality: "4K UHD",
      progress: "90%",
      badge: "👑 LEADERSHIP"
    },
    {
      id: "str-5",
      title: "कोविड काळातील जनसेवा व जनजागृती",
      showName: "Social Documentary",
      category: "documentary",
      videoId: "TF6cGB9Oc4g",
      image: "https://graminbharat-tv.com/wp-content/uploads/2026/01/hgjk.png",
      views: "89K views",
      duration: "22 Min",
      quality: "1080P HD",
      progress: "70%",
      badge: "⭐ EXCLUSIVE"
    },
    {
      id: "str-6",
      title: "गाव ते नेतृत्व - विशेष मुलाखत मालिका",
      showName: "Namdar Maharashtracha",
      category: "leadership",
      videoId: "F8mTudf-KiY",
      image: "https://graminbharat-tv.com/wp-content/uploads/2026/01/dsfdsg.jpg",
      views: "128K views",
      duration: "30 Min",
      quality: "4K UHD",
      progress: "85%",
      badge: "🔥 MUST WATCH"
    }
  ],

  worksVideos: [
    {
      id: "work-1",
      title: "Mission Janjagruti - Reaching Every Village",
      description: "The starting of a dedicated media network that reaches the innermost villages, covering grassroots farmers and rural issues.",
      videoId: "pMVpvyoamnk"
    },
    {
      id: "work-2",
      title: "Sarpanch Special Felicitation Ceremony",
      description: "Highlighting grassroot heroes who dedicated their lives to village transformation and rural public welfare.",
      videoId: "7FiFYH9TpPo"
    },
    {
      id: "work-3",
      title: "Farmer Awareness & Agricultural Technology",
      description: "Educating and inspiring farmers on water conservation, soil health, and modernized farming techniques.",
      videoId: "nFoNy5ReDSg"
    },
    {
      id: "work-4",
      title: "Rural Health & Pandemic Response Outreach",
      description: "Documentary showcasing on-ground relief and sanitation awareness campaigns during critical periods.",
      videoId: "TF6cGB9Oc4g"
    },
    {
      id: "work-5",
      title: "Empowering Rural Women & Self Help Groups",
      description: "Stories of change led by Mahila Bachat Gat and enterprising village women across Maharashtra.",
      videoId: "DXMeTB-OuOM"
    },
    {
      id: "work-6",
      title: "Youth in Agriculture & Rural Entrepreneurship",
      description: "Young village leaders steering the future of agro-business and decentralized village economy.",
      videoId: "0a_LrJM2F1c"
    }
  ],

  testimonials: [
    {
      id: 1,
      name: "Hon. Village Representative",
      role: "Sarpanch, Maharashtra Gram Panchayat",
      comment: "Gramin Bharat TV and Vilas Gadge have brought the real voice of rural Maharashtra to light. The 'Namdar Maharashtracha' initiative gave our village achievements genuine recognition across the state.",
      avatar: "https://graminbharat-tv.com/wp-content/uploads/2023/08/test4.webp"
    },
    {
      id: 2,
      name: "Shri Ashok Patil",
      role: "Agricultural Activist & Film Critic",
      comment: "A filmmaking journey of 25+ years that remains rooted in the soil. Vilas Gadge's documentaries on rural health and farmers are eye-openers for policy makers and citizens alike.",
      avatar: "https://graminbharat-tv.com/wp-content/uploads/2023/08/test2.png"
    },
    {
      id: 3,
      name: "Dr. Sunita Deshmukh",
      role: "Rural Health Coordinator",
      comment: "During our public health campaigns, the film screenings organized by Gramin Bharat TV mobilized thousands of villagers. Their visual storytelling power is truly unmatched.",
      avatar: "https://graminbharat-tv.com/wp-content/uploads/2023/08/test3.png"
    }
  ],

  goodWishes: [
    {
      id: 1,
      dignitary: "मा. ना. नितीन गडकरी",
      dignitaryEn: "Hon. Shri Nitin Gadkari",
      designation: "Union Minister of Road Transport & Highways, Govt. of India",
      tag: "🏛️ Govt. of India Official Letter",
      quote: "महाराष्ट्रातील सरपंचांसाठी 'नामदार महाराष्ट्राचा' या शो च्या निर्मितीबद्दल हार्दिक आनंद. या उपक्रमाच्या यशस्वीतेसाठी मनःपूर्वक शुभेच्छा.",
      date: "New Delhi",
      image: "https://graminbharat-tv.com/wp-content/uploads/2026/05/WhatsApp-Image-2025-12-30-at-12.55.01-PM-2.jpeg"
    },
    {
      id: 2,
      dignitary: "मा. ना. चंद्रशेखर बावनकुळे",
      dignitaryEn: "Hon. Shri Chandrashekhar Bawankule",
      designation: "Minister of Revenue & Parliamentary Affairs, Govt. of Maharashtra",
      tag: "🏛️ Govt. of Maharashtra Official Letter",
      quote: "ग्रामविकासातील सरपंचांच्या कार्याचा गौरव करणाऱ्या 'नामदार महाराष्ट्र' या अभिनव कार्यक्रमास माझ्या मनःपूर्वक हार्दिक शुभेच्छा.",
      date: "Mantralaya, Mumbai",
      image: "https://graminbharat-tv.com/wp-content/uploads/2026/05/WhatsApp-Image-2026-05-02-at-1.08.33-AM.jpeg"
    },
    {
      id: 3,
      dignitary: "मा. ना. जयकुमार गोरे",
      dignitaryEn: "Hon. Shri Jaykumar Gore",
      designation: "Minister of Rural Development & Panchayat Raj, Govt. of Maharashtra",
      tag: "🏛️ Rural Development Ministry",
      quote: "पंचायतराज व्यवस्थेला बळकटी देणाऱ्या आणि आदर्श सरपंचांचा गौरव करणाऱ्या 'नामदार महाराष्ट्र' या उपक्रमास खूप खूप शुभेच्छा!",
      date: "Mantralaya, Mumbai",
      image: "https://graminbharat-tv.com/wp-content/uploads/2026/05/fdhfd.jpg"
    }
  ],

  galleryImages: [
    {
      id: 1,
      title: "Namdar Maharashtracha Launch Poster",
      category: "Posters",
      image: "https://graminbharat-tv.com/wp-content/uploads/2026/04/WhatsApp-Image-2026-04-13-at-5.32.51-PM.jpeg"
    },
    {
      id: 2,
      title: "Gram Panchayat Leadership Series",
      category: "Posters",
      image: "https://graminbharat-tv.com/wp-content/uploads/2026/04/WhatsApp-Image-2026-04-13-at-5.32.50-PM-1.jpeg"
    },
    {
      id: 3,
      title: "Sarpanch Sanman Special Edition",
      category: "Posters",
      image: "https://graminbharat-tv.com/wp-content/uploads/2026/04/WhatsApp-Image-2026-04-13-at-5.32.50-PM-2.jpeg"
    },
    {
      id: 4,
      title: "Shruti Films Presentation Artwork",
      category: "Posters",
      image: "https://graminbharat-tv.com/wp-content/uploads/2026/04/WhatsApp-Image-2026-04-13-at-5.32.50-PM.jpeg"
    },
    {
      id: 5,
      title: "Director Vilas Gadge on Production Set",
      category: "Behind the Scenes",
      image: "https://graminbharat-tv.com/wp-content/uploads/2026/01/sdgdsg.jpg"
    },
    {
      id: 6,
      title: "Village Community Gathering & Screening",
      category: "Events",
      image: "https://graminbharat-tv.com/wp-content/uploads/2026/01/sfsd.jpg"
    }
  ],

  newsBlogs: [
    {
      id: 1,
      title: "ग्रामीण भागातील पाणी टंचाईवर मात: सरपंचांचा यशस्वी उपक्रम",
      slug: "rural-water-conservation-success",
      category: "Rural News",
      date: "Aug 15, 2026",
      author: "Vilas Gadge",
      image: "https://graminbharat-tv.com/wp-content/uploads/2023/08/news-1.webp",
      summary: "महाराष्ट्रातील खेड्यांमध्ये लोकसहभागातून राबवलेली जलसंधारण कामे आणि भूजल पातळी वाढवण्यासाठी सरपंचांचे अभूतपूर्व नियोजन.",
      readTime: "4 min read"
    },
    {
      id: 2,
      title: "शेतकऱ्यांसाठी आधुनिक तंत्रज्ञान व कृषी क्रांती",
      slug: "modern-farming-technology-maharashtra",
      category: "Agriculture",
      date: "Aug 12, 2026",
      author: "Editorial Team",
      image: "https://graminbharat-tv.com/wp-content/uploads/2023/08/blog-img-4.webp",
      summary: "डिजिटल शेती, ठिबक सिंचन आणि ड्रोन फवारणी तंत्रज्ञानाचा गावोगावी वाढता वापर. ग्रामीण अर्थव्यवस्थेत नवा उत्साह.",
      readTime: "5 min read"
    },
    {
      id: 3,
      title: "नामदार महाराष्ट्राचा: नव्या पर्वाची दमदार सुरुवात",
      slug: "namdar-maharashtracha-new-season",
      category: "Show Updates",
      date: "Aug 09, 2026",
      author: "Gramin Bharat TV",
      image: "https://graminbharat-tv.com/wp-content/uploads/2023/08/blog-img-3.webp",
      summary: "श्रुती फिल्म्स प्रस्तुत 'नामदार महाराष्ट्राचा' या विशेष मालिकेच्या नव्या भागांचे चित्रीकरण पूर्ण. लवकरच डिजिटल प्लॅटफॉर्मवर.",
      readTime: "3 min read"
    }
  ]
};

if (typeof window !== "undefined") {
  window.GBTV_DATA = GBTV_DATA;
}
