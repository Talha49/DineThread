const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'locales');
const files = ['en.json', 'ar.json', 'no.json', 'sv.json', 'da.json', 'tr.json'];

const translations = {
  en: {
    workflow: {
      tag: "Simple Workflow",
      title_1: "How SmartMenu",
      title_2: "works for you",
      steps: [
        { title: "Create Categories", desc: "Organize your menu into logical sections like Starters, Mains, and Drinks. Simply name them and set their order." },
        { title: "Add Menu Items", desc: "Upload photos, set prices, and add descriptions. You can update these instantly whenever your kitchen makes a change." },
        { title: "Design Your Brand", desc: "Use our Design Studio to pick colors, fonts, and layouts that match your restaurant's unique personality." },
        { title: "Optimize with AI", desc: "Activate AI heatmaps to highlight popular items and set 'Happy Hour' rules to automatically adjust prices." }
      ],
      why_optimize: "Why Optimize Your Menu?",
      why_desc: "A well-organized digital menu doesn't just look good—it sells more. By using our **AI Heatmap** and **Category Optimization**, you can guide your customers toward your highest-margin items automatically.",
      benefits: ["Real-time Dashboard Control", "Instant QR Code Generation"],
      table: { feature: "Feature", status: "Status", live: "Live", rows: ["Category Management", "AI Item Highlighting", "Dynamic Price Rules"] }
    },
    automation: {
      tag: "Intelligent Automation",
      title_1: "Automatic Seasonal",
      title_2: "Themes & Pricing",
      desc: "Stop worrying about updating your menu for every holiday. SmartMenu automatically changes your themes and atmosphere effects to match the season, and optimizes your prices for Happy Hour.",
      features: ["12 Pre-configured Monthly Overlays", "Automated Lighting & Color Transitions", "Dynamic Background Particle Engines", "Manual Preview Dashboard Toggles"]
    },
    testimonial: {
      quote: "\"The design studio is a game-changer. We've seen a 22% increase in average order value through AI heatmaps.\"",
      author: "Marcus Sterling",
      role: "Director, Gastronomy Group"
    },
    cta: {
      title_1: "Ready to elevate",
      title_2: "your experience?",
      subtitle: "Join thousands of world-class restaurants transforming their digital presence today.",
      btn: "Get Started Now",
      trial: "14-Day Free Trial",
      no_card: "No Credit Card Required"
    },
    features: {
      tag: "Powerful Features",
      title_1: "Everything you need to",
      title_2: "grow your sales",
      desc: "We've built a complete set of tools to help you manage your restaurant's digital presence effortlessly.",
      items: [
        { title: "Visual Design Studio", desc: "Customizable high-end aesthetics with premium fonts, colors, and layouts that match your brand perfectly." },
        { title: "AI 'Hot' Badges", desc: "Automatically highlight your top-selling and trending items to help customers make faster, better choices." },
        { title: "Auto-Magic Themes", desc: "Your menu changes with the calendar. Automatic atmosphere effects for Winter, Spring, Summer, and Autumn." },
        { title: "Happy Hour Engine", desc: "Schedule discounts and dynamic pricing rules that update instantly on your customers' phones." },
        { title: "Atmosphere Effects", desc: "Add immersive snowfall, flower petals, or stars to your background to create a unique dining mood." },
        { title: "Live Price Sync", desc: "Change a price in your dashboard and see it update across all customer devices in less than a second." }
      ]
    },
    pricing: {
      tag: "Simple Pricing",
      title_1: "Grow your business",
      title_2: "at your own pace",
      plans: [
        { name: "Basic", price: "Free", desc: "The perfect start for small cafes.", features: ["Up to 15 Menu Items", "Basic Brand Colors", "Live QR Scanning", "Mobile Friendly Layout", "Community Support"], cta: "Start for Free" },
        { name: "Smart Pro", price: "TBD", period: "/mo", desc: "Everything you need for growth.", popular: "Most Popular", features: ["Unlimited Menu Items", "Automated Seasonal Themes", "AI-Driven 'Hot' Badges", "Scheduled Happy Hours", "Custom Branding & Fonts", "Email Support"], cta: "Try 7 Days Free" },
        { name: "Enterprise", price: "TBD", period: "/mo", desc: "For multi-location restaurant groups.", features: ["Multi-location Dashboard", "Full White-label Options", "Advanced API Access", "Dedicated Account Manager", "Custom Theme Design", "24/7 Phone Support"], cta: "Contact Sales" }
      ]
    }
  },
  ar: {
    workflow: {
      tag: "سير عمل بسيط",
      title_1: "كيف تعمل القائمة الذكية",
      title_2: "من أجلك",
      steps: [
        { title: "إنشاء الفئات", desc: "نظم قائمتك في أقسام منطقية مثل المقبلات، والأطباق الرئيسية، والمشروبات. ببساطة قم بتسميتها وتحديد ترتيبها." },
        { title: "إضافة العناصر", desc: "قم بتحميل الصور، وحدد الأسعار، وأضف الأوصاف. يمكنك تحديثها فورًا متى ما حدث تغيير في مطبخك." },
        { title: "صمم علامتك", desc: "استخدم استوديو التصميم لاختيار الألوان والخطوط والتخطيطات التي تناسب شخصية مطعمك الفريدة." },
        { title: "التحسين بالذكاء الاصطناعي", desc: "قم بتفعيل الخرائط الحرارية لإبراز العناصر الشائعة وإعداد قواعد 'ساعة التخفيضات' لضبط الأسعار تلقائيًا." }
      ],
      why_optimize: "لماذا تحسن قائمتك؟",
      why_desc: "القائمة الرقمية المنظمة جيدًا لا تبدو رائعة فحسب - بل تبيع أكثر. باستخدام **الخريطة الحرارية الذكية** و**تحسين الفئات**، يمكنك توجيه عملائك نحو العناصر الأكثر ربحية تلقائيًا.",
      benefits: ["تحكم فوري عبر لوحة القيادة", "إنشاء رمز QR فورًا"],
      table: { feature: "الميزة", status: "الحالة", live: "مباشر", rows: ["إدارة الفئات", "إبراز العناصر الذكي", "قواعد الأسعار الديناميكية"] }
    },
    automation: {
      tag: "أتمتة ذكية",
      title_1: "سمات وأسعار",
      title_2: "موسمية تلقائية",
      desc: "توقف عن القلق بشأن تحديث قائمتك لكل عطلة. تقوم القائمة الذكية بتغيير السمات وتأثيرات الأجواء تلقائيًا لتتناسب مع الموسم، وتحسن أسعارك لساعات التخفيضات.",
      features: ["12 مظهر شهري مسبق التكوين", "انتقالات تلقائية للإضاءة والألوان", "محركات جزيئات خلفية ديناميكية", "مفاتيح معاينة يدوية في لوحة القيادة"]
    },
    testimonial: {
      quote: "\"استوديو التصميم هو نقطة تحول. لقد رأينا زيادة بنسبة 22٪ في متوسط قيمة الطلب من خلال الخرائط الحرارية للذكاء الاصطناعي.\"",
      author: "ماركوس ستيرلينج",
      role: "مدير مجموعة الطهي"
    },
    cta: {
      title_1: "مستعد للارتقاء",
      title_2: "بتجربتك؟",
      subtitle: "انضم إلى آلاف المطاعم العالمية التي تحول وجودها الرقمي اليوم.",
      btn: "ابدأ الآن",
      trial: "نسخة تجريبية مجانية 14 يوم",
      no_card: "لا يتطلب بطاقة ائتمان"
    },
    features: {
      tag: "ميزات قوية",
      title_1: "كل ما تحتاجه",
      title_2: "لزيادة مبيعاتك",
      desc: "لقد قمنا ببناء مجموعة كاملة من الأدوات لمساعدتك في إدارة التواجد الرقمي لمطعمك بسهولة.",
      items: [
        { title: "استوديو التصميم المرئي", desc: "جماليات متطورة قابلة للتخصيص مع خطوط وألوان وتخطيطات متميزة تناسب علامتك التجارية." },
        { title: "شارات 'ساخنة' ذكية", desc: "إبراز العناصر الأكثر مبيعًا والتريند تلقائيًا لمساعدة العملاء على اتخاذ خيارات أسرع." },
        { title: "سمات سحرية تلقائية", desc: "قائمتك تتغير مع التقويم. تأثيرات أجواء تلقائية للشتاء والربيع والصيف والخريف." },
        { title: "محرك ساعات التخفيضات", desc: "جدولة الخصومات وقواعد التسعير الديناميكية التي تتحدث فورًا على هواتف عملائك." },
        { title: "تأثيرات الأجواء", desc: "أضف تساقط الثلوج، بتلات الزهور، أو النجوم إلى خلفيتك لخلق مزاج طعام فريد." },
        { title: "مزامنة الأسعار المباشرة", desc: "قم بتغيير السعر في لوحة القيادة الخاصة بك وشاهده يتحدث عبر أجهزة العملاء في أقل من ثانية." }
      ]
    },
    pricing: {
      tag: "تسعير بسيط",
      title_1: "قم بتنمية عملك",
      title_2: "بالوتيرة التي تناسبك",
      plans: [
        { name: "أساسي", price: "مجاني", desc: "البداية المثالية للمقاهي الصغيرة.", features: ["حتى 15 عنصر قائمة", "ألوان العلامة الأساسية", "مسح QR مباشر", "تخطيط مناسب للجوال", "دعم مجتمعي"], cta: "ابدأ مجانًا" },
        { name: "برو الذكي", price: "يحدد لاحقاً", period: "/شهر", desc: "كل ما تحتاجه للنمو.", popular: "الأكثر شيوعًا", features: ["عناصر قائمة غير محدودة", "سمات موسمية تلقائية", "شارات ذكية مبنية على الذكاء الاصطناعي", "ساعات تخفيضات مجدولة", "هوية وخطوط مخصصة", "دعم عبر البريد"], cta: "جرب 7 أيام مجانًا" },
        { name: "الشركات", price: "يحدد لاحقاً", period: "/شهر", desc: "لمجموعات المطاعم متعددة الفروع.", features: ["لوحة تحكم متعددة الفروع", "خيارات العلامة البيضاء الكاملة", "وصول API متقدم", "مدير حساب مخصص", "تصميم سمة مخصصة", "دعم هاتفي 24/7"], cta: "تواصل مع المبيعات" }
      ]
    }
  },
  no: {
    workflow: {
      tag: "Enkel arbeidsflyt",
      title_1: "Hvordan SmartMenu",
      title_2: "fungerer for deg",
      steps: [
        { title: "Opprett kategorier", desc: "Organiser menyen i logiske seksjoner som Forretter, Hovedretter og Drikke." },
        { title: "Legg til elementer", desc: "Last opp bilder, sett priser og legg til beskrivelser." },
        { title: "Design merkevaren din", desc: "Bruk Design Studio for å velge farger, skrifttyper og oppsett." },
        { title: "Optimaliser med AI", desc: "Aktiver AI-varmekart for å fremheve populære elementer." }
      ],
      why_optimize: "Hvorfor optimalisere menyen din?",
      why_desc: "En godt organisert digital meny selger mer. Ved å bruke **AI-varmekart** og **Kategorioptimalisering**, kan du guide kundene automatisk.",
      benefits: ["Sanntids dashbord-kontroll", "Umiddelbar QR-kodegenerering"],
      table: { feature: "Funksjon", status: "Status", live: "Live", rows: ["Kategoristyring", "AI-elementfremheving", "Dynamiske prisregler"] }
    },
    automation: {
      tag: "Intelligent Automasjon",
      title_1: "Automatisk sesongbasert",
      title_2: "Temaer og priser",
      desc: "SmartMenu endrer automatisk temaene og atmosfæreeffektene dine for å matche sesongen.",
      features: ["12 forhåndskonfigurerte månedlige overlegg", "Automatiske fargeoverganger", "Dynamiske bakgrunnspartikler", "Manuelle forhåndsvisningsbrytere"]
    },
    testimonial: {
      quote: "\"Designstudioet er fantastisk. Vi har sett en 22% økning i gjennomsnittlig ordreverdi.\"",
      author: "Marcus Sterling",
      role: "Direktør, Gastronomy Group"
    },
    cta: {
      title_1: "Klar til å heve",
      title_2: "opplevelsen din?",
      subtitle: "Bli med tusenvis av restauranter som forbedrer sin digitale tilstedeværelse.",
      btn: "Kom i gang nå",
      trial: "14-dagers gratis prøveperiode",
      no_card: "Ingen kredittkort kreves"
    },
    features: {
      tag: "Kraftige funksjoner",
      title_1: "Alt du trenger for å",
      title_2: "øke salget ditt",
      desc: "Vi har bygget et komplett sett med verktøy for å hjelpe deg med å administrere restaurantens digitale tilstedeværelse.",
      items: [
        { title: "Visuelt Designstudio", desc: "Tilpassbar high-end estetikk med premium skrifttyper og farger." },
        { title: "AI 'Hot'-merker", desc: "Fremhev automatisk de mest solgte elementene." },
        { title: "Auto-Magiske Temaer", desc: "Menyen endres med kalenderen. Vinter, Vår, Sommer og Høst." },
        { title: "Happy Hour-motor", desc: "Planlegg rabatter og dynamiske prisregler." },
        { title: "Atmosfæreeffekter", desc: "Legg til snøfall, blomsterblader eller stjerner." },
        { title: "Live Prissynkronisering", desc: "Endre en pris i dashbordet og se den oppdateres umiddelbart." }
      ]
    },
    pricing: {
      tag: "Enkle Priser",
      title_1: "La bedriften vokse",
      title_2: "i ditt eget tempo",
      plans: [
        { name: "Basis", price: "Gratis", desc: "Den perfekte starten for små kafeer.", features: ["Opptil 15 elementer", "Grunnleggende farger", "Live QR-skanning", "Mobilvennlig", "Fellesskapsstøtte"], cta: "Start gratis" },
        { name: "Smart Pro", price: "TBD", period: "/mnd", desc: "Alt du trenger for vekst.", popular: "Mest populær", features: ["Ubegrensede elementer", "Sesongtemaer", "AI-merker", "Planlagte Happy Hours", "Egendefinert merkevare", "E-poststøtte"], cta: "Prøv 7 dager gratis" },
        { name: "Bedrift", price: "TBD", period: "/mnd", desc: "For restaurantgrupper med flere lokasjoner.", features: ["Flerlokasjons-dashbord", "White-label", "Avansert API", "Dedikert manager", "Egendefinert design", "24/7 telefonstøtte"], cta: "Kontakt Salg" }
      ]
    }
  },
  sv: {
    workflow: {
      tag: "Enkelt arbetsflöde",
      title_1: "Hur SmartMenu",
      title_2: "fungerar för dig",
      steps: [
        { title: "Skapa kategorier", desc: "Organisera menyn i logiska avsnitt som Förrätter, Varmrätter och Drycker." },
        { title: "Lägg till objekt", desc: "Ladda upp foton, ställ in priser och lägg till beskrivningar." },
        { title: "Designa ditt varumärke", desc: "Använd Design Studio för att välja färger, teckensnitt och layouter." },
        { title: "Optimera med AI", desc: "Aktivera AI-värmekartor för att lyfta fram populära rätter." }
      ],
      why_optimize: "Varför optimera din meny?",
      why_desc: "En välorganiserad digital meny säljer mer. Genom att använda **AI-värmekartor** och **Kategorioptimering** kan du vägleda kunderna.",
      benefits: ["Realtidskontroll", "Omedelbar QR-kodgenerering"],
      table: { feature: "Funktion", status: "Status", live: "Live", rows: ["Kategorihantering", "AI-objektsmarkering", "Dynamiska prisregler"] }
    },
    automation: {
      tag: "Intelligent Automation",
      title_1: "Automatiska säsongsbaserade",
      title_2: "Teman & Priser",
      desc: "SmartMenu ändrar automatiskt dina teman och atmosfäreffekter för att matcha säsongen.",
      features: ["12 förkonfigurerade månatliga överlägg", "Automatiska färgövergångar", "Dynamiska bakgrundspartiklar", "Manuella förhandsgranskningar"]
    },
    testimonial: {
      quote: "\"Designstudion är banbrytande. Vi har sett en 22% ökning i genomsnittligt ordervärde.\"",
      author: "Marcus Sterling",
      role: "Direktör, Gastronomy Group"
    },
    cta: {
      title_1: "Redo att lyfta",
      title_2: "din upplevelse?",
      subtitle: "Gå med i tusentals restauranger som förvandlar sin digitala närvaro.",
      btn: "Kom igång nu",
      trial: "14 dagars gratis provperiod",
      no_card: "Inget kreditkort krävs"
    },
    features: {
      tag: "Kraftfulla funktioner",
      title_1: "Allt du behöver för",
      title_2: "att öka försäljningen",
      desc: "Vi har byggt en komplett uppsättning verktyg för att hjälpa dig hantera din restaurang digitalt.",
      items: [
        { title: "Visuell Designstudio", desc: "Anpassningsbar high-end estetik med premiumtypsnitt och färger." },
        { title: "AI 'Heta' märken", desc: "Markera automatiskt dina mest sålda rätter." },
        { title: "Auto-Magiska Teman", desc: "Din meny ändras med kalendern. Vinter, Vår, Sommar, Höst." },
        { title: "Happy Hour-motor", desc: "Schemalägg rabatter och dynamiska prisregler." },
        { title: "Atmosfäreffekter", desc: "Lägg till snöfall, blomblad eller stjärnor i din bakgrund." },
        { title: "Live Prissynkronisering", desc: "Ändra ett pris och se det uppdateras direkt." }
      ]
    },
    pricing: {
      tag: "Enkel Prissättning",
      title_1: "Väx din verksamhet",
      title_2: "i din egen takt",
      plans: [
        { name: "Bas", price: "Gratis", desc: "Den perfekta starten för små kaféer.", features: ["Upp till 15 rätter", "Grundläggande färger", "Live QR-skanning", "Mobilvänlig", "Gemenskapssupport"], cta: "Starta gratis" },
        { name: "Smart Pro", price: "TBD", period: "/mån", desc: "Allt du behöver för tillväxt.", popular: "Mest populär", features: ["Obegränsat antal rätter", "Säsongsteman", "AI-märken", "Schemalagda Happy Hours", "Anpassat varumärke", "E-postsupport"], cta: "Prova 7 dagar gratis" },
        { name: "Företag", price: "TBD", period: "/mån", desc: "För restauranggrupper på flera platser.", features: ["Multilokation", "White-label", "Avancerat API", "Dedikerad chef", "Anpassad design", "24/7 telefonsupport"], cta: "Kontakta Försäljning" }
      ]
    }
  },
  da: {
    workflow: {
      tag: "Simpel arbejdsgang",
      title_1: "Hvordan SmartMenu",
      title_2: "fungerer for dig",
      steps: [
        { title: "Opret Kategorier", desc: "Organiser din menu i logiske sektioner som Forretter, Hovedretter og Drikkevarer." },
        { title: "Tilføj Elementer", desc: "Upload billeder, angiv priser og tilføj beskrivelser." },
        { title: "Design Dit Brand", desc: "Brug Design Studio til at vælge farver, skrifttyper og layout." },
        { title: "Optimer med AI", desc: "Aktiver AI-varmekort for at fremhæve populære elementer." }
      ],
      why_optimize: "Hvorfor optimere din menu?",
      why_desc: "En velorganiseret digital menu sælger mere. Ved at bruge **AI-varmekort** kan du guide kunderne.",
      benefits: ["Realtids kontrol", "Øjeblikkelig QR-kodegenerering"],
      table: { feature: "Funktion", status: "Status", live: "Live", rows: ["Kategoristyring", "AI-elementfremhævning", "Dynamiske prisregler"] }
    },
    automation: {
      tag: "Intelligent Automation",
      title_1: "Automatisk Sæsonbaseret",
      title_2: "Temaer & Priser",
      desc: "SmartMenu ændrer automatisk dine temaer for at matche sæsonen.",
      features: ["12 forudkonfigurerede månedlige overlays", "Automatiske farveovergange", "Dynamiske baggrundspartikler", "Manuelle forhåndsvisninger"]
    },
    testimonial: {
      quote: "\"Designstudiet er fantastisk. Vi har set en stigning på 22% i den gennemsnitlige ordreværdi.\"",
      author: "Marcus Sterling",
      role: "Direktør, Gastronomy Group"
    },
    cta: {
      title_1: "Klar til at hæve",
      title_2: "din oplevelse?",
      subtitle: "Slut dig til tusindvis af restauranter.",
      btn: "Kom i gang nu",
      trial: "14-dages gratis prøveperiode",
      no_card: "Intet kreditkort kræves"
    },
    features: {
      tag: "Kraftfulde funktioner",
      title_1: "Alt hvad du behøver for at",
      title_2: "øge dit salg",
      desc: "Vi har bygget et komplet sæt værktøjer.",
      items: [
        { title: "Visuelt Design Studio", desc: "Tilpas high-end æstetik med premium skrifttyper og farver." },
        { title: "AI 'Hot'-badges", desc: "Fremhæv automatisk dine bedst sælgende varer." },
        { title: "Auto-Magiske Temaer", desc: "Din menu ændrer sig med kalenderen. Vinter, Forår, Sommer, Efterår." },
        { title: "Happy Hour-motor", desc: "Planlæg rabatter og dynamiske prisregler." },
        { title: "Atmosfæreeffekter", desc: "Tilføj snefald, blomsterblade eller stjerner." },
        { title: "Live Prissynkronisering", desc: "Ændre en pris og se den opdatere med det samme." }
      ]
    },
    pricing: {
      tag: "Simpel Prissætning",
      title_1: "Udvid din forretning",
      title_2: "i dit eget tempo",
      plans: [
        { name: "Basis", price: "Gratis", desc: "Den perfekte start.", features: ["Op til 15 elementer", "Grundlæggende farver", "Live QR-scanning", "Mobilvenlig", "Community Support"], cta: "Start gratis" },
        { name: "Smart Pro", price: "TBD", period: "/md", desc: "Alt til vækst.", popular: "Mest populær", features: ["Ubegrænsede elementer", "Sæsontemaer", "AI-badges", "Planlagte Happy Hours", "Brugerdefineret brand", "E-mail support"], cta: "Prøv 7 dage gratis" },
        { name: "Virksomhed", price: "TBD", period: "/md", desc: "For restaurantgrupper.", features: ["Multilokation", "White-label", "Avanceret API", "Dedikeret manager", "Brugerdefineret design", "24/7 support"], cta: "Kontakt Salg" }
      ]
    }
  },
  tr: {
    workflow: {
      tag: "Basit İş Akışı",
      title_1: "SmartMenu Sizin İçin",
      title_2: "Nasıl Çalışır",
      steps: [
        { title: "Kategoriler Oluşturun", desc: "Menünüzü mantıksal bölümlere ayırın. Sadece isim verin ve sıralarını belirleyin." },
        { title: "Öğeler Ekleyin", desc: "Fotoğraf yükleyin, fiyat belirleyin ve açıklama ekleyin." },
        { title: "Markanızı Tasarlayın", desc: "Restoranınıza uygun renk, yazı tipi ve düzeni seçin." },
        { title: "Yapay Zeka ile Optimize Edin", desc: "Popüler öğeleri vurgulamak için ısı haritalarını etkinleştirin." }
      ],
      why_optimize: "Menünüzü Neden Optimize Etmelisiniz?",
      why_desc: "İyi düzenlenmiş bir dijital menü daha çok satar. **Yapay Zeka Isı Haritası** kullanarak müşterilerinizi yönlendirin.",
      benefits: ["Gerçek zamanlı kontrol", "Anında QR Kod"],
      table: { feature: "Özellik", status: "Durum", live: "Aktif", rows: ["Kategori Yönetimi", "Yapay Zeka Vurgulama", "Dinamik Fiyatlandırma"] }
    },
    automation: {
      tag: "Akıllı Otomasyon",
      title_1: "Otomatik Mevsimsel",
      title_2: "Temalar ve Fiyatlandırma",
      desc: "SmartMenu temalarınızı mevsime göre otomatik değiştirir.",
      features: ["12 aylık ön ayar", "Otomatik renk geçişleri", "Dinamik arka plan", "Manuel önizleme"]
    },
    testimonial: {
      quote: "\"Tasarım stüdyosu oyun değiştirici. Ortalama sipariş değerinde %22 artış gördük.\"",
      author: "Marcus Sterling",
      role: "Direktör, Gastronomi Grubu"
    },
    cta: {
      title_1: "Deneyiminizi",
      title_2: "yükseltmeye hazır mısınız?",
      subtitle: "Binlerce dünya standartlarında restorana katılın.",
      btn: "Hemen Başla",
      trial: "14 Gün Ücretsiz Deneme",
      no_card: "Kredi Kartı Gerekmez"
    },
    features: {
      tag: "Güçlü Özellikler",
      title_1: "Satışlarınızı artırmak",
      title_2: "için gereken her şey",
      desc: "Dijital varlığınızı yönetmeniz için tam bir araç seti geliştirdik.",
      items: [
        { title: "Görsel Tasarım Stüdyosu", desc: "Premium yazı tipleri ve renklerle özelleştirilebilir estetik." },
        { title: "Yapay Zeka 'Sıcak' Rozetleri", desc: "En çok satan ürünlerinizi otomatik olarak vurgulayın." },
        { title: "Otomatik Temalar", desc: "Menünüz takvimle birlikte değişir. Kış, İlkbahar, Yaz, Sonbahar." },
        { title: "Happy Hour Motoru", desc: "İndirimleri ve fiyat kurallarını planlayın." },
        { title: "Atmosfer Efektleri", desc: "Arka planınıza kar, çiçek veya yıldız ekleyin." },
        { title: "Canlı Fiyat Senkronizasyonu", desc: "Panonuzdan bir fiyatı değiştirin ve anında güncellensin." }
      ]
    },
    pricing: {
      tag: "Basit Fiyatlandırma",
      title_1: "İşletmenizi kendi",
      title_2: "hızınızda büyütün",
      plans: [
        { name: "Temel", price: "Ücretsiz", desc: "Küçük kafeler için mükemmel başlangıç.", features: ["15 Öğeye Kadar", "Temel Renkler", "Canlı QR", "Mobil Uyumlu", "Topluluk Desteği"], cta: "Ücretsiz Başla" },
        { name: "Akıllı Pro", price: "TBD", period: "/ay", desc: "Büyüme için gereken her şey.", popular: "En Popüler", features: ["Sınırsız Öğe", "Mevsimsel Temalar", "Yapay Zeka Rozetleri", "Planlı İndirimler", "Özel Markalama", "E-posta Desteği"], cta: "7 Gün Ücretsiz Dene" },
        { name: "Kurumsal", price: "TBD", period: "/ay", desc: "Çok şubeli gruplar için.", features: ["Çoklu Şube", "White-label", "Gelişmiş API", "Özel Yönetici", "Özel Tasarım", "7/24 Destek"], cta: "Satışla İletişime Geç" }
      ]
    }
  }
};

files.forEach(file => {
  const code = file.replace('.json', '');
  const filePath = path.join(localesDir, file);
  if (fs.existsSync(filePath) && translations[code]) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.home = { ...data.home, ...translations[code] };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated ${file}`);
  }
});
