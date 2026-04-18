// nodes.js — Game narrative data
export const nodes = {
  1: {
    icon: '🔑',
    text: 'أمامك منضدة عتيقة. فوقها مفتاحٌ فضيّ وآخر للسيارة.',
    choices: [
      { text: 'أخذ المفتاح الفضّي', action: inv => { inv.hasSilverKey = true; }, condition: inv => !inv.hasSilverKey, next: 3 },
      { text: 'أخذ مفتاح السيارة', action: inv => { inv.hasCarKey = true; }, condition: inv => !inv.hasCarKey, next: 4 },
      { text: 'أغلق', action: null, next: null, close: true },
    ]
  },
  3: { icon: '✦', text: 'احتفظت بالمفتاح الفضّي بأمان.', choices: [{ text: 'العودة', next: 1 }] },
  4: { icon: '✦', text: 'احتفظت بمفتاح السيارة.', choices: [{ text: 'العودة', next: 1 }] },

  6: {
    icon: '🚗',
    text: 'سيارة مركونة. مقودها بارد كالمعدن في فجر الشتاء. يتوقف نظام ملاحتها بانتظار الإحداثيات.',
    choices: [
      { text: 'تشغيل نظام الملاحة بالمفتاح', condition: inv => inv.hasCarKey, next: 7 },
      { text: 'أغلق', close: true },
    ]
  },
  7: {
    icon: '📍',
    text: 'النظام يطلب ولاية الوجهة الحقيقية. أين هو الآن؟',
    choices: [
      { text: 'إلينوي (Illinois)', next: 99 },
      { text: 'إنديانا (Indiana)', action: inv => { inv.hasLocation = true; }, next: 10 },
      { text: 'أوهايو (Ohio)', next: 99 },
    ]
  },
  10: { icon: '✦', text: 'تم حفظ الإحداثيات. تصريح العبور للمسافة نشط.', choices: [{ text: 'إغلاق', close: true }] },

  8: {
    icon: '📖',
    text: 'مذكّرة مجلّدة بالجلد وسمراء الغلاف. قفلها الصغير يتحدى الفضول.',
    choices: [
      { text: 'فتحها بالمفتاح الفضّي', condition: inv => inv.hasSilverKey, next: 9 },
      { text: 'أغلق', close: true },
    ]
  },
  9: {
    icon: '💭',
    text: 'تعيش جود صراعاً داخلياً مستمراً بين قوتين. ما هما؟',
    choices: [
      { text: 'طبيعتها العاطفية مقابل سعيها للمنطق والمثالية', next: 15 },
      { text: 'صخب الحياة الاجتماعية مقابل العمل', next: 99 },
      { text: 'رغبة الاستقلال مقابل الحاجة للتوجيه', next: 99 },
    ]
  },
  12: { icon: '✦', text: 'أبحرت في أعماق المذكرة. استوعبت جوهر الصراع الداخلي بالكامل.', choices: [{ text: 'إغلاق', action: inv => { inv.hasJournal = true; }, close: true }] },

  30: {
    icon: '🎬',
    text: 'شاشة سينما من السبعينيات. تطلب منك ورقة تذكرة الفيلم المفضل لجود.',
    choices: [
      { text: 'How to Lose a Guy in 10 Days', next: 99 },
      { text: '10 Things I Hate About You', next: 31 },
      { text: 'The Perks of Being a Wallflower', next: 99 },
      { text: 'أغلق', close: true },
    ]
  },
  31: {
    icon: '🎵',
    text: 'صحيح. المشغّل الموسيقي القديم يطلب الآن الاسم. من أكثر فنانة تسمعها جود؟',
    choices: [
      { text: 'Taylor Swift', action: inv => { inv.hasMusic = true; }, next: 32 },
      { text: 'Lana Del Rey', next: 99 },
      { text: 'Phoebe Bridgers', action: inv => { inv.hasMusic = true; }, next: 32 },
    ]
  },
  32: { icon: '✦', text: '(تم التوثيق)', choices: [{ text: 'إغلاق', close: true }] },

  40: {
    icon: '🍝',
    text: 'طاولة في مقهى دافئ. القائمة تفتح بسؤال: ما أكلتها المفضلة؟',
    choices: [
      { text: 'الباستا', next: 41 },
      { text: 'البيتزا', next: 99 },
      { text: 'السوشي', next: 41 },
      { text: 'أغلق', close: true },
    ]
  },
  41: {
    icon: '🍵',
    text: 'النادل يسمعك. وما مشروبها؟',
    choices: [
      { text: 'القهوة', next: 99 },
      { text: 'الماتشا', next: 42 },
      { text: 'الشاي', next: 99 },
    ]
  },
  42: {
    icon: '🍨',
    text: 'والحلوى المكمّلة للطلب؟',
    choices: [
      { text: 'التيراميسو', next: 99 },
      { text: 'الكوكيز', next: 99 },
      { text: 'الآيس كريم', action: inv => { inv.hasCafe = true; }, next: 43 },
    ]
  },
  43: { icon: '✦', text: 'الطلب المثالي مكتمل. الوجبة المفضلة محفوظة.', choices: [{ text: 'إغلاق', close: true }] },

  60: {
    icon: '🎓',
    text: 'لوحة تعليمية معلّقة. تصف مسيرة جود الأكاديمية. أين تدرس وما تخصصها؟',
    choices: [
      { text: 'جامعة جازان — نظم المعلومات', next: 99 },
      { text: 'جامعة جازان — تقنية المعلومات', next: 61 },
      { text: 'جامعة جازان — علوم الحاسب', next: 99 },
      { text: 'أغلق', close: true },
    ]
  },
  61: {
    icon: '🔬',
    text: 'صحيح. وموضوع مشروع تخرجها؟',
    choices: [
      { text: 'تحليل سياسات الأمن', next: 99 },
      { text: 'استكشاف سلوكيات المستخدمين تجاه الخصوصية', action: inv => { inv.hasUni = true; }, next: 62 },
      { text: 'الذكاء الاصطناعي في التعليم', next: 99 },
    ]
  },
  62: { icon: '✦', text: 'السجل الأكاديمي وُثِّق بالكامل.', choices: [{ text: 'إغلاق', close: true }] },

  11: {
    icon: '🌻',
    text: 'حقل زهور. زرعتها بحنان. فيها جود. اختر الزهرة الموجودة فيها.',
    choices: [
      { text: 'زنبق أبيض', next: 99 },
      { text: 'تباع الشمس', action: inv => { inv.hasFlower = true; }, next: 24 },
      { text: 'ورد أحمر', next: 99 },
      { text: 'أغلق', close: true },
    ]
  },
  24: { icon: '✦', text: 'اخترت بصدق. زهرة تباع الشمس معك الآن.', choices: [{ text: 'إغلاق', close: true }] },

  13: {
    icon: '🐈',
    text: 'الحارسة الصامتة. تجلس عند بوابة الحقيقة. أثبت أنك جمعت المكونات الستة.',
    choices: [
      {
        text: '— تقديم الأدلة الستة —',
        condition: inv => inv.hasLocation && inv.hasJournal && inv.hasFlower && inv.hasMusic && inv.hasCafe && inv.hasUni,
        next: 200
      },
      { text: 'العودة للبحث', close: true }
    ]
  },

  15: {
    icon: '💡',
    text: 'ما القيمة التي تضعها جود فوق كل شيء في التعامل مع الآخرين؟',
    choices: [
      { text: 'اللطف لتجنب الإيذاء', next: 99 },
      { text: 'الوضوح والمنطق والصدق', next: 16 },
      { text: 'الطمأنينة المستمرة', next: 99 },
    ]
  },
  16: {
    icon: '🌙',
    text: 'حين يبلغ الألم ذروته، كيف يظهر الانزعاج عند جود؟',
    choices: [
      { text: 'انفجار غضب عال', next: 99 },
      { text: 'بكاء وطلب حل فوري', next: 99 },
      { text: 'انسحاب صامت وعجز مؤقت عن الكلام', next: 17 },
    ]
  },
  17: {
    icon: '🤍',
    text: 'ما الخوف الأعمق الذي يسكنها في العلاقات؟',
    choices: [
      { text: 'فقدان ذلك الشخص من حياتها كلياً', next: 18 },
      { text: 'الرفض الصريح', next: 99 },
      { text: 'انقطاع التواصل اليومي', next: 99 },
    ]
  },
  18: {
    icon: '🪞',
    text: 'حين يُثني أحدهم على مظهرها، كيف تستقبل المديح؟',
    choices: [
      { text: 'ترفضه وتعدّه مجاملة فارغة', next: 99 },
      { text: 'تشكّك داخلياً وتحلّله، لكنها ممتنة بصمت', next: 19 },
      { text: 'تتقبّله بثقة كاملة', next: 99 },
    ]
  },
  19: {
    icon: '💬',
    text: 'حين يقلقها أمر شخص تهتم به، ما الذي تفعله؟',
    choices: [
      { text: 'تُلحّ في السؤال حتى تطمئن', next: 20 },
      { text: 'تتظاهر باللامبالاة', next: 99 },
      { text: 'تبتعد وتنتظر منه الاهتمام', next: 99 },
    ]
  },
  20: {
    icon: '🌧',
    text: 'وحين ينخفض مزاجها، ما أدق توصيف لحالتها؟',
    choices: [
      { text: 'فوضى مشاعر تجعلها تتكلم أكثر', next: 99 },
      { text: 'أنماط دورية: انسحاب، فقدان الشغف، نوم عميق', next: 21 },
      { text: 'نادراً ما ينخفض مزاجها', next: 99 },
    ]
  },
  21: {
    icon: '💭',
    text: 'ما الشيء الذي يُفاقم شعورها عند الإرهاق النفسي؟',
    choices: [
      { text: 'الطمأنينة المبهمة والإيجابية المفرطة', next: 12 },
      { text: 'إعطاؤها مساحة صمت حقيقية', next: 99 },
      { text: 'محاولة إعطائها حلولاً منطقية', next: 99 },
    ]
  },
  200: {
    icon: '✨',
    text: 'سؤال البوابة الأخير: من هو أكثر شخص تحبه جود؟',
    choices: [
      { text: 'فواز', next: 23 },
      { text: 'زوجها', next: 23 },
      { text: 'أنا', next: 23 },
    ]
  },
  23: { text: 'END', choices: [] },

  99: {
    icon: '✗',
    text: 'عدم تطابق في البصمة النفسية. ستعود للبداية.',
    choices: [{
      text: 'العودة', close: true, reset: true,
    }]
  },
};
