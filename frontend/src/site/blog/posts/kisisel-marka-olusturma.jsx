import { H2, H3, P, UL, OL, A, Callout, InlineCta } from '../PostBody.jsx';
import { useLanguage } from '../../../context/LanguageContext.jsx';

export const meta = {
  slug: 'personal-branding-guide',
  title: {
    tr: 'Kişisel Marka Oluşturma: 90 Günde Fark Yaratan 6 Adım',
    en: 'Personal Branding: 6 Steps to Stand Out in 90 Days',
    ru: 'Личный бренд: 6 шагов, чтобы выделиться за 90 дней',
    es: 'Marca personal: 6 pasos para destacar en 90 días',
    de: 'Personal Branding: In 90 Tagen herausstechen',
    fr: 'Marque personnelle : se démarquer en 90 jours',
    pt: 'Marca pessoal: 6 passos para se destacar em 90 dias',
    it: 'Brand personale: 6 passi per distinguerti in 90 giorni',
    ja: '個人ブランドの作り方：90日で目立つ6ステップ',
  },
  description: {
    tr: 'İnternette dikkat çeken bir kişisel marka nasıl kurulur? Konumlandırma, içerik stratejisi, tutarlılık ve dijital varlık — 6 pratik adımda anlattık.',
    en: 'How do you build a personal brand that gets noticed online? Positioning, content strategy, consistency, and digital presence, all in 6 practical steps.',
    ru: 'Как построить личный бренд, который заметят в интернете? Позиционирование, контент-стратегия, постоянство и цифровое присутствие в 6 шагах.',
    es: '¿Cómo construir una marca personal que destaque online? Posicionamiento, estrategia de contenido, coherencia y presencia digital en 6 pasos.',
    de: 'Wie baust du eine persönliche Marke auf, die online auffällt? Positionierung, Content-Strategie, Konsistenz und digitale Präsenz in 6 Schritten.',
    fr: 'Comment bâtir une marque personnelle qui se remarque en ligne ? Positionnement, stratégie de contenu, cohérence et présence numérique en 6 étapes.',
    pt: 'Como construir uma marca pessoal que se destaca online? Posicionamento, estratégia de conteúdo, consistência e presença digital em 6 passos.',
    it: 'Come costruire un brand personale che si fa notare online? Posizionamento, strategia dei contenuti, coerenza e presenza digitale in 6 passi.',
    ja: 'オンラインで注目される個人ブランドをどう築くのか。ポジショニング、コンテンツ戦略、一貫性、デジタルでの存在感を6つの実践ステップで解説します。',
  },
  category: 'markalasma',
  tags: {
    tr: ['kişisel marka', 'branding', 'içerik', 'strateji'],
    en: ['personal brand', 'branding', 'content', 'strategy'],
    ru: ['личный бренд', 'брендинг', 'контент', 'стратегия'],
    es: ['marca personal', 'branding', 'contenido', 'estrategia'],
    de: ['personal brand', 'branding', 'content', 'strategie'],
    fr: ['marque personnelle', 'branding', 'contenu', 'stratégie'],
    pt: ['marca pessoal', 'branding', 'conteúdo', 'estratégia'],
    it: ['brand personale', 'branding', 'contenuti', 'strategia'],
    ja: ['個人ブランド', 'ブランディング', 'コンテンツ', '戦略'],
  },
  publishedAt: '2026-07-07',
  updatedAt: '2026-07-07',
  readingMinutes: 8,
  image: '/og-image.png',
  faq: {
    tr: [
      { q: 'Kişisel marka oluşturmak için kaç takipçim olmalı?', a: 'Kişisel marka takipçi sayısıyla değil, sözünün geçtiği kitleyle ölçülür. 500 gerçek takipçi, 50.000 boş takipçiden değerlidir.' },
      { q: 'Hangi platformda başlamalıyım?', a: 'Hedef kitlenin en aktif olduğu tek platformla başla. LinkedIn (B2B), Instagram (görsel), YouTube (uzun form), TikTok (Z kuşağı). Tek yerde iyi ol, sonra çeşitlendir.' },
      { q: 'Kişisel markam ne kadar zamanda oluşur?', a: 'Tutarlı çalışmayla 90 gün içinde ilk sonuçları görürsün, 12 ayda ciddi bir kitle oluşturursun. Sabır ve süreklilik en önemli iki değişken.' },
    ],
    en: [
      { q: 'How many followers do I need to build a personal brand?', a: 'A personal brand is measured by the audience that trusts you, not by follower count. 500 real followers are worth more than 50,000 empty ones.' },
      { q: 'Which platform should I start on?', a: 'Start with the single platform where your target audience is most active. LinkedIn (B2B), Instagram (visual), YouTube (long-form), TikTok (Gen Z). Get great at one place first, then diversify.' },
      { q: 'How long does it take to build a personal brand?', a: 'With consistent work you\'ll see the first results within 90 days and build a serious audience within 12 months. Patience and consistency are the two variables that matter most.' },
    ],
    ru: [
      { q: 'Сколько подписчиков нужно для личного бренда?', a: 'Личный бренд измеряется аудиторией, которая вам доверяет, а не числом подписчиков. 500 настоящих подписчиков ценнее 50 000 пустых.' },
      { q: 'На какой платформе начинать?', a: 'Начните с одной платформы, где ваша целевая аудитория наиболее активна. LinkedIn (B2B), Instagram (визуал), YouTube (длинный формат), TikTok (поколение Z). Сначала станьте отличным в одном месте, потом расширяйтесь.' },
      { q: 'Сколько времени занимает создание личного бренда?', a: 'При постоянной работе первые результаты вы увидите за 90 дней, а серьёзную аудиторию соберёте за 12 месяцев. Терпение и постоянство это две самые важные переменные.' },
    ],
    es: [
      { q: '¿Cuántos seguidores necesito para construir una marca personal?', a: 'Una marca personal se mide por la audiencia que confía en ti, no por el número de seguidores. 500 seguidores reales valen más que 50.000 vacíos.' },
      { q: '¿En qué plataforma debería empezar?', a: 'Empieza por la única plataforma donde tu público objetivo está más activo. LinkedIn (B2B), Instagram (visual), YouTube (formato largo), TikTok (generación Z). Hazte excelente en un solo sitio primero y luego diversifica.' },
      { q: '¿Cuánto tarda en construirse una marca personal?', a: 'Con un trabajo constante verás los primeros resultados en 90 días y construirás una audiencia seria en 12 meses. La paciencia y la constancia son las dos variables que más importan.' },
    ],
    de: [
      { q: 'Wie viele Follower brauche ich für eine persönliche Marke?', a: 'Eine persönliche Marke misst sich am Publikum, das dir vertraut, nicht an der Follower-Zahl. 500 echte Follower sind mehr wert als 50.000 leere.' },
      { q: 'Auf welcher Plattform sollte ich starten?', a: 'Starte mit der einen Plattform, auf der deine Zielgruppe am aktivsten ist. LinkedIn (B2B), Instagram (visuell), YouTube (Langform), TikTok (Gen Z). Werde erst an einem Ort richtig gut, dann diversifiziere.' },
      { q: 'Wie lange dauert der Aufbau einer persönlichen Marke?', a: 'Mit konsequenter Arbeit siehst du die ersten Ergebnisse innerhalb von 90 Tagen und baust innerhalb von 12 Monaten ein ernsthaftes Publikum auf. Geduld und Konsistenz sind die zwei wichtigsten Variablen.' },
    ],
    fr: [
      { q: 'Combien d\'abonnés faut-il pour bâtir une marque personnelle ?', a: 'Une marque personnelle se mesure à l\'audience qui vous fait confiance, pas au nombre d\'abonnés. 500 vrais abonnés valent plus que 50 000 abonnés vides.' },
      { q: 'Sur quelle plateforme commencer ?', a: 'Commencez par la seule plateforme où votre audience cible est la plus active. LinkedIn (B2B), Instagram (visuel), YouTube (format long), TikTok (génération Z). Devenez excellent à un seul endroit, puis diversifiez.' },
      { q: 'Combien de temps faut-il pour bâtir une marque personnelle ?', a: 'Avec un travail régulier, vous verrez les premiers résultats en 90 jours et bâtirez une audience solide en 12 mois. La patience et la régularité sont les deux variables qui comptent le plus.' },
    ],
    pt: [
      { q: 'Quantos seguidores preciso para construir uma marca pessoal?', a: 'Uma marca pessoal se mede pela audiência que confia em você, não pelo número de seguidores. 500 seguidores reais valem mais que 50.000 vazios.' },
      { q: 'Em qual plataforma devo começar?', a: 'Comece pela única plataforma onde o seu público-alvo está mais ativo. LinkedIn (B2B), Instagram (visual), YouTube (formato longo), TikTok (Geração Z). Fique excelente em um só lugar primeiro e depois diversifique.' },
      { q: 'Quanto tempo leva para construir uma marca pessoal?', a: 'Com trabalho consistente, você vê os primeiros resultados em 90 dias e constrói uma audiência séria em 12 meses. Paciência e consistência são as duas variáveis que mais importam.' },
    ],
    it: [
      { q: 'Quanti follower servono per costruire un brand personale?', a: 'Un brand personale si misura dal pubblico che si fida di te, non dal numero di follower. 500 follower veri valgono più di 50.000 vuoti.' },
      { q: 'Da quale piattaforma dovrei iniziare?', a: 'Inizia dall\'unica piattaforma dove il tuo pubblico è più attivo. LinkedIn (B2B), Instagram (visivo), YouTube (formato lungo), TikTok (Gen Z). Diventa bravo in un posto solo, poi diversifica.' },
      { q: 'Quanto tempo ci vuole per costruire un brand personale?', a: 'Con un lavoro costante vedi i primi risultati entro 90 giorni e costruisci un pubblico solido entro 12 mesi. Pazienza e costanza sono le due variabili che contano di più.' },
    ],
    ja: [
      { q: '個人ブランドを作るには、フォロワーが何人必要ですか？', a: '個人ブランドはフォロワー数ではなく、あなたを信頼してくれるオーディエンスで測られます。本物のフォロワー500人は、中身のない50,000人より価値があります。' },
      { q: 'どのプラットフォームから始めるべきですか？', a: 'ターゲット層がいちばん活発な、1つのプラットフォームから始めましょう。LinkedIn（B2B）、Instagram（ビジュアル）、YouTube（長尺）、TikTok（Z世代）。まず1か所で上手くなり、それから広げます。' },
      { q: '個人ブランドの構築にはどのくらいかかりますか？', a: '一貫して取り組めば、90日以内に最初の成果が見え、12か月で本格的なオーディエンスが育ちます。忍耐と継続が、最も重要な2つの変数です。' },
    ],
  },
};

function PostTr() {
  return (
    <>
      <P>
        "Kişisel marka" son 5 yılın en çok konuşulan konularından biri. Ama çoğu içerik boş sloganlarda kalıyor.
        Bu rehberde bir yıl içinde <strong>gerçek fark yaratan</strong> 6 pratik adımı, gerçek örneklerle anlattık.
      </P>

      <H2>Neden kişisel marka?</H2>
      <P>
        Şirket ismi bir CV'de yerini kaybedebilir. Ama <strong>senin adın</strong> Google'da aranıyorsa, sen zaten bir markasın.
        Kişisel marka:
      </P>
      <UL>
        <li>Daha yüksek maaşlı işlere kapı açar</li>
        <li>Freelance ya da danışmanlık dönüşünde iş bulma süreni %70 kısaltır</li>
        <li>Fikirlerini duyurmanı, insanlara ilham vermeni sağlar</li>
        <li>İşinden bağımsız bir gelir kanalı oluşturur (kitap, kurs, sponsorluk)</li>
      </UL>

      <H2>Adım 1: Konumlandırma (kim, neyi, kim için?)</H2>
      <P>
        En çok göz ardı edilen ama en önemli adım. Şu üç soruyu cevapla:
      </P>
      <OL>
        <li><strong>Ben kimim?</strong> — Uzman, öğreten, ilham veren, eğlendiren?</li>
        <li><strong>Ne yapıyorum?</strong> — Web tasarım, kişisel finans, resim eğitimi, yemek...</li>
        <li><strong>Kime hitap ediyorum?</strong> — Yeni başlayanlar, mid-level profesyoneller, üst düzey yöneticiler?</li>
      </OL>
      <P>
        Cevaplar tek cümlede birleşince <strong>konum önerin</strong> ortaya çıkar. Örnek:
      </P>
      <Callout>
        "Yeni başlayan web tasarımcılar için Figma öğreten uygulamalı içerikler üretiyorum."
      </Callout>

      <H2>Adım 2: Tek bir platformda derinleş</H2>
      <P>
        Herkes her yerde olmaya çalışıyor — sen tersini yap. Konumlandırmana en uygun tek platformu seç:
      </P>
      <UL>
        <li><strong>LinkedIn:</strong> B2B, kurumsal profesyoneller, danışmanlar</li>
        <li><strong>Instagram:</strong> Görsel odaklı (tasarım, moda, yemek, seyahat)</li>
        <li><strong>YouTube:</strong> Uzun form eğitim, teknik anlatım, vlog</li>
        <li><strong>TikTok:</strong> Kısa video, mizah, hızlı ipuçları, Z kuşağı</li>
        <li><strong>X (Twitter):</strong> Fikirler, teknoloji, medya, sohbet</li>
      </UL>

      <H2>Adım 3: İçerik ritmini oluştur</H2>
      <P>
        Kişisel markanın kalbi tutarlılık. Haftada 2 gerçekten iyi içerik, günde 5 dolgu içeriğinden değerlidir.
        Kolay bir başlangıç ritmi:
      </P>
      <UL>
        <li>Pazartesi: Öğretici içerik (nasıl yapılır?)</li>
        <li>Çarşamba: Fikir/görüş (bir konu hakkındaki düşüncen)</li>
        <li>Cuma: Kişisel/hikaye (deneyim, ilham veren an)</li>
      </UL>

      <InlineCta
        title="Kişisel marka için biolink kur"
        desc="Tüm sosyal medyanı, portföyünü ve iletişimini tek sayfada göster. BeyLink ile ücretsiz."
        href="/register"
        label="Ücretsiz Başla →"
      />

      <H2>Adım 4: Dijital varlığını topla</H2>
      <P>
        Bir yerdeki takipçini başka yere taşımak zor. Bu yüzden <A href="/">link-in-bio sayfası</A> senin dijital
        merkezin olmalı. Instagram bio'sunda, LinkedIn profilinde, YouTube açıklamasında, e-posta imzanda — hepsi
        aynı tek link.
      </P>
      <P>
        Bu sayfa şunları içermeli:
      </P>
      <UL>
        <li>Tüm aktif sosyal medya hesapların</li>
        <li>Portföy veya en iyi işlerin</li>
        <li>İletişim yöntemi (e-posta, WhatsApp, form)</li>
        <li>Newsletter kaydı (uzun vadeli değer için en önemli araç)</li>
        <li>Kurs, kitap ya da ücretli hizmet varsa oralara link</li>
      </UL>

      <H2>Adım 5: Yavaş yavaş çeşitlendir</H2>
      <P>
        90 gün sonra ilk platformunda güçlü olduğunda ikinci platforma geç. Instagram'daki fotoğrafları kısa
        videolara çevirip TikTok'a taşı. YouTube'daki uzun içeriği LinkedIn yazısına dönüştür. Aynı fikri
        farklı formatta değerlendir — <strong>üretim yükün 2 kata çıkar ama etki 5 kata çıkar</strong>.
      </P>

      <H2>Adım 6: Ölç ve iyileştir</H2>
      <P>
        Kişisel marka ölçülmezse büyümez. Ayda bir kez:
      </P>
      <UL>
        <li>Hangi içerik en çok etkileşim aldı?</li>
        <li>Hangi sosyal medya en çok bio linki tıklattı? (BeyLink BTAG ile ölç)</li>
        <li>Hangi konu okuyucu/izleyicini en çok yorum yapmaya itti?</li>
      </UL>

      <Callout tone="warn" title="Uyarı: sahte popülariteden kaç">
        Takipçi satın alma, botlar ve sahte etkileşim <strong>uzun vadede seni öldürür</strong>. Algoritmalar bunu
        yakalar ve organik ulaşımın düşer. Yavaş ama gerçek büyüme her zaman kazanır.
      </Callout>

      <H2>Sonuç</H2>
      <P>
        Kişisel marka bir gecede oluşmaz ama <strong>doğru başlangıç</strong> her şey. Bugün konumlandırmanı yaz,
        yarın ilk içeriğini paylaş, üçüncü gün <A href="/register">BeyLink sayfanı</A> kurup her yere link'i tak.
        90 gün sonra döndüğünde farkı sen de göreceksin.
      </P>
    </>
  );
}

function PostEn() {
  return (
    <>
      <P>
        "Personal brand" has been one of the most talked-about topics of the last five years. Yet most of what's
        written about it never gets past empty slogans. In this guide we lay out 6 practical steps that make a
        <strong> real difference</strong> within a year, backed by real examples.
      </P>

      <H2>Why build a personal brand?</H2>
      <P>
        A company name can disappear from a résumé. But if <strong>your name</strong> is what people search on Google,
        you're already a brand. A personal brand:
      </P>
      <UL>
        <li>Opens the door to higher-paying roles</li>
        <li>Cuts your job-hunting time by 70% when you go freelance or into consulting</li>
        <li>Lets you share your ideas and inspire other people</li>
        <li>Builds an income stream independent of your day job (books, courses, sponsorships)</li>
      </UL>

      <H2>Step 1: Positioning (who, what, for whom?)</H2>
      <P>
        The most overlooked step, and the most important one. Answer these three questions:
      </P>
      <OL>
        <li><strong>Who am I?</strong> An expert, a teacher, an inspirer, an entertainer?</li>
        <li><strong>What do I do?</strong> Web design, personal finance, painting lessons, cooking...</li>
        <li><strong>Who am I speaking to?</strong> Beginners, mid-level professionals, senior executives?</li>
      </OL>
      <P>
        When the answers come together in a single sentence, your <strong>positioning statement</strong> emerges. For example:
      </P>
      <Callout>
        "I create hands-on content that teaches Figma to beginner web designers."
      </Callout>

      <H2>Step 2: Go deep on a single platform</H2>
      <P>
        Everyone tries to be everywhere; do the opposite. Pick the one platform that best fits your positioning:
      </P>
      <UL>
        <li><strong>LinkedIn:</strong> B2B, corporate professionals, consultants</li>
        <li><strong>Instagram:</strong> Visual-first (design, fashion, food, travel)</li>
        <li><strong>YouTube:</strong> Long-form education, technical deep dives, vlogs</li>
        <li><strong>TikTok:</strong> Short video, humor, quick tips, Gen Z</li>
        <li><strong>X (Twitter):</strong> Ideas, technology, media, conversation</li>
      </UL>

      <H2>Step 3: Set your content rhythm</H2>
      <P>
        Consistency is the heart of a personal brand. Two genuinely good pieces a week beat five filler posts a day.
        An easy starting rhythm:
      </P>
      <UL>
        <li>Monday: Educational content (how-to)</li>
        <li>Wednesday: Opinion/perspective (your take on a topic)</li>
        <li>Friday: Personal/story (an experience, an inspiring moment)</li>
      </UL>

      <InlineCta
        title="Set up a bio link for your personal brand"
        desc="Show all your social media, portfolio, and contact details on one page. Free with BeyLink."
        href="/register"
        label="Start Free →"
      />

      <H2>Step 4: Consolidate your digital presence</H2>
      <P>
        Moving followers from one place to another is hard. That's why a <A href="/">link-in-bio page</A> should be
        your digital hub. In your Instagram bio, on your LinkedIn profile, in your YouTube description, in your email
        signature, all the same single link.
      </P>
      <P>
        This page should include:
      </P>
      <UL>
        <li>All of your active social media accounts</li>
        <li>Your portfolio or best work</li>
        <li>A way to get in touch (email, WhatsApp, form)</li>
        <li>A newsletter signup (the single most important tool for long-term value)</li>
        <li>Links to any course, book, or paid service you offer</li>
      </UL>

      <H2>Step 5: Diversify slowly</H2>
      <P>
        After 90 days, once you're strong on your first platform, move to a second one. Turn your Instagram photos into
        short videos for TikTok. Repurpose your long YouTube content into a LinkedIn post. Get more mileage out of the
        same idea in a different format. <strong>Your production load doubles, but your impact multiplies fivefold</strong>.
      </P>

      <H2>Step 6: Measure and improve</H2>
      <P>
        A personal brand that isn't measured won't grow. Once a month, ask:
      </P>
      <UL>
        <li>Which content earned the most engagement?</li>
        <li>Which social channel drove the most bio-link clicks? (Measure it with BeyLink BTAG)</li>
        <li>Which topic pushed your readers/viewers to comment the most?</li>
      </UL>

      <Callout tone="warn" title="Warning: steer clear of fake popularity">
        Buying followers, bots, and fake engagement <strong>will kill you in the long run</strong>. Algorithms catch it,
        and your organic reach drops. Slow but genuine growth always wins.
      </Callout>

      <H2>Conclusion</H2>
      <P>
        A personal brand isn't built overnight, but the <strong>right start</strong> is everything. Write your
        positioning today, share your first piece of content tomorrow, and on day three set up your
        <A href="/register"> BeyLink page</A> and drop the link everywhere. When you look back 90 days later, you'll see
        the difference for yourself.
      </P>
    </>
  );
}

function PostRu() {
  return (
    <>
      <P>
        «Личный бренд» это одна из самых обсуждаемых тем последних пяти лет. Но большинство того, что о нём пишут, так и
        не выходит за рамки пустых лозунгов. В этом руководстве мы излагаем 6 практических шагов, которые дают
        <strong> реальную разницу</strong> в течение года, подкреплённых реальными примерами.
      </P>

      <H2>Зачем строить личный бренд?</H2>
      <P>
        Название компании может исчезнуть из резюме. Но если <strong>ваше имя</strong> это то, что люди ищут в Google,
        вы уже бренд. Личный бренд:
      </P>
      <UL>
        <li>Открывает двери к более высокооплачиваемым ролям</li>
        <li>Сокращает время поиска работы на 70%, когда вы уходите во фриланс или консалтинг</li>
        <li>Позволяет делиться идеями и вдохновлять других людей</li>
        <li>Создаёт источник дохода, не зависящий от основной работы (книги, курсы, спонсорство)</li>
      </UL>

      <H2>Шаг 1: Позиционирование (кто, что, для кого?)</H2>
      <P>
        Самый недооценённый шаг и самый важный. Ответьте на эти три вопроса:
      </P>
      <OL>
        <li><strong>Кто я?</strong> Эксперт, учитель, вдохновитель, развлекатель?</li>
        <li><strong>Что я делаю?</strong> Веб-дизайн, личные финансы, уроки рисования, кулинария...</li>
        <li><strong>К кому я обращаюсь?</strong> К новичкам, специалистам среднего уровня, топ-руководителям?</li>
      </OL>
      <P>
        Когда ответы сходятся в одно предложение, появляется ваше <strong>позиционирующее утверждение</strong>. Например:
      </P>
      <Callout>
        «Я создаю практический контент, который учит Figma начинающих веб-дизайнеров.»
      </Callout>

      <H2>Шаг 2: Углубитесь в одну платформу</H2>
      <P>
        Все пытаются быть везде; делайте наоборот. Выберите одну платформу, которая лучше всего подходит вашему позиционированию:
      </P>
      <UL>
        <li><strong>LinkedIn:</strong> B2B, корпоративные специалисты, консультанты</li>
        <li><strong>Instagram:</strong> визуал в первую очередь (дизайн, мода, еда, путешествия)</li>
        <li><strong>YouTube:</strong> длинное обучение, технические разборы, влоги</li>
        <li><strong>TikTok:</strong> короткое видео, юмор, быстрые советы, поколение Z</li>
        <li><strong>X (Twitter):</strong> идеи, технологии, медиа, диалог</li>
      </UL>

      <H2>Шаг 3: Задайте ритм контента</H2>
      <P>
        Постоянство это сердце личного бренда. Два по-настоящему хороших материала в неделю бьют пять проходных постов в
        день. Простой стартовый ритм:
      </P>
      <UL>
        <li>Понедельник: обучающий контент (как сделать)</li>
        <li>Среда: мнение/взгляд (ваша точка зрения на тему)</li>
        <li>Пятница: личное/история (опыт, вдохновляющий момент)</li>
      </UL>

      <InlineCta
        title="Соберите ссылку в био для личного бренда"
        desc="Покажите все соцсети, портфолио и контакты на одной странице. Бесплатно с BeyLink."
        href="/register"
        label="Начать бесплатно →"
      />

      <H2>Шаг 4: Сведите цифровое присутствие воедино</H2>
      <P>
        Переносить подписчиков из одного места в другое трудно. Именно поэтому <A href="/">страница ссылки в био</A>
        должна быть вашим цифровым центром. В Instagram-био, в профиле LinkedIn, в описании YouTube, в подписи к письмам,
        всюду одна и та же ссылка.
      </P>
      <P>
        Эта страница должна включать:
      </P>
      <UL>
        <li>Все ваши активные аккаунты в соцсетях</li>
        <li>Ваше портфолио или лучшие работы</li>
        <li>Способ связаться (почта, WhatsApp, форма)</li>
        <li>Подписку на рассылку (самый важный инструмент для долгосрочной ценности)</li>
        <li>Ссылки на любой курс, книгу или платную услугу, которые вы предлагаете</li>
      </UL>

      <H2>Шаг 5: Расширяйтесь медленно</H2>
      <P>
        Через 90 дней, когда вы сильны на первой платформе, переходите ко второй. Превращайте фото из Instagram в короткие
        видео для TikTok. Переупаковывайте длинный контент YouTube в пост для LinkedIn. Выжимайте больше из одной и той же
        идеи в разных форматах. <strong>Ваша производственная нагрузка удваивается, но эффект вырастает впятеро</strong>.
      </P>

      <H2>Шаг 6: Измеряйте и улучшайте</H2>
      <P>
        Личный бренд, который не измеряют, не растёт. Раз в месяц спрашивайте:
      </P>
      <UL>
        <li>Какой контент собрал больше всего вовлечённости?</li>
        <li>Какой канал в соцсетях дал больше всего кликов по ссылке в био? (Измеряйте это с помощью BeyLink BTAG)</li>
        <li>Какая тема сильнее всего подтолкнула ваших читателей/зрителей комментировать?</li>
      </UL>

      <Callout tone="warn" title="Предупреждение: держитесь подальше от фальшивой популярности">
        Покупка подписчиков, боты и накрутка вовлечённости <strong>убьют вас в долгосрочной перспективе</strong>.
        Алгоритмы это ловят, и ваш органический охват падает. Медленный, но настоящий рост всегда побеждает.
      </Callout>

      <H2>Заключение</H2>
      <P>
        Личный бренд не строится за одну ночь, но <strong>правильный старт</strong> это всё. Напишите позиционирование
        сегодня, опубликуйте первый материал завтра, а на третий день соберите свою
        <A href="/register"> страницу BeyLink</A> и вставьте ссылку повсюду. Оглянувшись через 90 дней, вы сами увидите
        разницу.
      </P>
    </>
  );
}

function PostEs() {
  return (
    <>
      <P>
        "Marca personal" ha sido uno de los temas más comentados de los últimos cinco años. Pero casi todo lo que se
        escribe sobre ello nunca pasa de los eslóganes vacíos. En esta guía exponemos 6 pasos prácticos que marcan una
        <strong> diferencia real</strong> en un año, respaldados por ejemplos reales.
      </P>

      <H2>¿Por qué construir una marca personal?</H2>
      <P>
        El nombre de una empresa puede desaparecer de un currículum. Pero si <strong>tu nombre</strong> es lo que la
        gente busca en Google, ya eres una marca. Una marca personal:
      </P>
      <UL>
        <li>Te abre la puerta a puestos mejor pagados</li>
        <li>Reduce un 70% tu tiempo de búsqueda de empleo cuando pasas al freelance o a la consultoría</li>
        <li>Te permite compartir tus ideas e inspirar a otras personas</li>
        <li>Crea una fuente de ingresos independiente de tu trabajo diario (libros, cursos, patrocinios)</li>
      </UL>

      <H2>Paso 1: Posicionamiento (¿quién, qué, para quién?)</H2>
      <P>
        El paso más ignorado y el más importante. Responde a estas tres preguntas:
      </P>
      <OL>
        <li><strong>¿Quién soy?</strong> ¿Experto, docente, inspirador, entretenedor?</li>
        <li><strong>¿Qué hago?</strong> Diseño web, finanzas personales, clases de pintura, cocina...</li>
        <li><strong>¿A quién me dirijo?</strong> ¿A principiantes, a profesionales de nivel medio, a altos directivos?</li>
      </OL>
      <P>
        Cuando las respuestas se juntan en una sola frase, surge tu <strong>declaración de posicionamiento</strong>. Por ejemplo:
      </P>
      <Callout>
        "Creo contenido práctico que enseña Figma a diseñadores web principiantes."
      </Callout>

      <H2>Paso 2: Profundiza en una sola plataforma</H2>
      <P>
        Todo el mundo intenta estar en todas partes; haz lo contrario. Elige la única plataforma que mejor encaje con tu posicionamiento:
      </P>
      <UL>
        <li><strong>LinkedIn:</strong> B2B, profesionales corporativos, consultores</li>
        <li><strong>Instagram:</strong> lo visual primero (diseño, moda, comida, viajes)</li>
        <li><strong>YouTube:</strong> formación de formato largo, análisis técnicos, vlogs</li>
        <li><strong>TikTok:</strong> vídeo corto, humor, consejos rápidos, generación Z</li>
        <li><strong>X (Twitter):</strong> ideas, tecnología, medios, conversación</li>
      </UL>

      <H2>Paso 3: Establece tu ritmo de contenido</H2>
      <P>
        La coherencia es el corazón de una marca personal. Dos piezas genuinamente buenas a la semana ganan a cinco
        publicaciones de relleno al día. Un ritmo fácil para empezar:
      </P>
      <UL>
        <li>Lunes: contenido educativo (cómo hacer)</li>
        <li>Miércoles: opinión/punto de vista (tu enfoque sobre un tema)</li>
        <li>Viernes: personal/historia (una experiencia, un momento inspirador)</li>
      </UL>

      <InlineCta
        title="Monta un enlace en la bio para tu marca personal"
        desc="Muestra todas tus redes sociales, tu portafolio y tu contacto en una página. Gratis con BeyLink."
        href="/register"
        label="Empieza gratis →"
      />

      <H2>Paso 4: Consolida tu presencia digital</H2>
      <P>
        Mover seguidores de un sitio a otro es difícil. Por eso una <A href="/">página link in bio</A> debería ser tu
        centro digital. En tu bio de Instagram, en tu perfil de LinkedIn, en tu descripción de YouTube, en tu firma de
        correo, siempre el mismo enlace único.
      </P>
      <P>
        Esta página debería incluir:
      </P>
      <UL>
        <li>Todas tus cuentas de redes sociales activas</li>
        <li>Tu portafolio o tus mejores trabajos</li>
        <li>Una forma de contacto (correo, WhatsApp, formulario)</li>
        <li>Un registro a la newsletter (la herramienta más importante para el valor a largo plazo)</li>
        <li>Enlaces a cualquier curso, libro o servicio de pago que ofrezcas</li>
      </UL>

      <H2>Paso 5: Diversifica despacio</H2>
      <P>
        Tras 90 días, cuando ya seas fuerte en tu primera plataforma, pasa a una segunda. Convierte tus fotos de
        Instagram en vídeos cortos para TikTok. Reutiliza tu contenido largo de YouTube en una publicación de LinkedIn.
        Saca más partido de la misma idea en un formato distinto. <strong>Tu carga de producción se duplica, pero tu
        impacto se multiplica por cinco</strong>.
      </P>

      <H2>Paso 6: Mide y mejora</H2>
      <P>
        Una marca personal que no se mide no crece. Una vez al mes, pregúntate:
      </P>
      <UL>
        <li>¿Qué contenido logró más interacción?</li>
        <li>¿Qué canal social generó más clics en el enlace de la bio? (Mídelo con BTAG de BeyLink)</li>
        <li>¿Qué tema empujó más a tus lectores/espectadores a comentar?</li>
      </UL>

      <Callout tone="warn" title="Advertencia: aléjate de la popularidad falsa">
        Comprar seguidores, los bots y la interacción falsa <strong>te matarán a la larga</strong>. Los algoritmos lo
        detectan y tu alcance orgánico cae. El crecimiento lento pero genuino siempre gana.
      </Callout>

      <H2>Conclusión</H2>
      <P>
        Una marca personal no se construye de la noche a la mañana, pero el <strong>arranque correcto</strong> lo es
        todo. Escribe tu posicionamiento hoy, comparte tu primer contenido mañana y, al tercer día, monta tu
        <A href="/register"> página de BeyLink</A> y pon el enlace en todas partes. Cuando mires atrás 90 días después,
        verás la diferencia por ti mismo.
      </P>
    </>
  );
}

function PostDe() {
  return (
    <>
      <P>
        „Persönliche Marke“ war eines der meistdiskutierten Themen der letzten fünf Jahre. Doch fast alles, was darüber
        geschrieben wird, kommt nie über leere Slogans hinaus. In diesem Guide legen wir 6 praktische Schritte dar, die
        innerhalb eines Jahres einen <strong>echten Unterschied</strong> machen, untermauert mit echten Beispielen.
      </P>

      <H2>Warum eine persönliche Marke aufbauen?</H2>
      <P>
        Ein Firmenname kann aus einem Lebenslauf verschwinden. Aber wenn <strong>dein Name</strong> das ist, wonach Leute
        bei Google suchen, bist du bereits eine Marke. Eine persönliche Marke:
      </P>
      <UL>
        <li>Öffnet die Tür zu besser bezahlten Rollen</li>
        <li>Verkürzt deine Jobsuche um 70 %, wenn du in Freelancing oder Beratung gehst</li>
        <li>Lässt dich deine Ideen teilen und andere Menschen inspirieren</li>
        <li>Baut eine Einnahmequelle unabhängig von deinem Hauptjob auf (Bücher, Kurse, Sponsorings)</li>
      </UL>

      <H2>Schritt 1: Positionierung (wer, was, für wen?)</H2>
      <P>
        Der am meisten übersehene Schritt und zugleich der wichtigste. Beantworte diese drei Fragen:
      </P>
      <OL>
        <li><strong>Wer bin ich?</strong> Ein Experte, ein Lehrer, ein Inspirator, ein Entertainer?</li>
        <li><strong>Was mache ich?</strong> Webdesign, persönliche Finanzen, Malunterricht, Kochen ...</li>
        <li><strong>Zu wem spreche ich?</strong> Zu Anfängern, Profis mittlerer Ebene, Führungskräften?</li>
      </OL>
      <P>
        Wenn die Antworten in einem einzigen Satz zusammenkommen, entsteht dein <strong>Positionierungs-Statement</strong>.
        Zum Beispiel:
      </P>
      <Callout>
        „Ich erstelle praxisnahen Content, der Figma an Webdesign-Anfänger vermittelt.“
      </Callout>

      <H2>Schritt 2: Geh auf einer einzigen Plattform in die Tiefe</H2>
      <P>
        Alle versuchen, überall zu sein; mach das Gegenteil. Wähle die eine Plattform, die am besten zu deiner
        Positionierung passt:
      </P>
      <UL>
        <li><strong>LinkedIn:</strong> B2B, Corporate-Profis, Berater</li>
        <li><strong>Instagram:</strong> visuell zuerst (Design, Mode, Food, Reisen)</li>
        <li><strong>YouTube:</strong> Langform-Bildung, technische Deep Dives, Vlogs</li>
        <li><strong>TikTok:</strong> Kurzvideo, Humor, schnelle Tipps, Gen Z</li>
        <li><strong>X (Twitter):</strong> Ideen, Technologie, Medien, Austausch</li>
      </UL>

      <H2>Schritt 3: Leg deinen Content-Rhythmus fest</H2>
      <P>
        Konsistenz ist das Herz einer persönlichen Marke. Zwei wirklich gute Beiträge pro Woche schlagen fünf Füll-Posts
        pro Tag. Ein einfacher Start-Rhythmus:
      </P>
      <UL>
        <li>Montag: lehrreicher Content (How-to)</li>
        <li>Mittwoch: Meinung/Perspektive (deine Sicht auf ein Thema)</li>
        <li>Freitag: Persönliches/Story (eine Erfahrung, ein inspirierender Moment)</li>
      </UL>

      <InlineCta
        title="Richte einen Bio-Link für deine persönliche Marke ein"
        desc="Zeige all deine Social Media, dein Portfolio und deine Kontaktdaten auf einer Seite. Kostenlos mit BeyLink."
        href="/register"
        label="Kostenlos starten →"
      />

      <H2>Schritt 4: Bündle deine digitale Präsenz</H2>
      <P>
        Follower von einem Ort zum anderen zu bewegen, ist schwer. Deshalb sollte eine{' '}
        <A href="/">Link-in-Bio-Seite</A> dein digitaler Knotenpunkt sein. In deiner Instagram-Bio, auf deinem
        LinkedIn-Profil, in deiner YouTube-Beschreibung, in deiner E-Mail-Signatur, überall derselbe eine Link.
      </P>
      <P>
        Diese Seite sollte enthalten:
      </P>
      <UL>
        <li>Alle deine aktiven Social-Media-Konten</li>
        <li>Dein Portfolio oder deine besten Arbeiten</li>
        <li>Eine Möglichkeit, Kontakt aufzunehmen (E-Mail, WhatsApp, Formular)</li>
        <li>Eine Newsletter-Anmeldung (das mit Abstand wichtigste Werkzeug für langfristigen Wert)</li>
        <li>Links zu jedem Kurs, Buch oder kostenpflichtigen Angebot, das du hast</li>
      </UL>

      <H2>Schritt 5: Diversifiziere langsam</H2>
      <P>
        Nach 90 Tagen, wenn du auf deiner ersten Plattform stark bist, geh zu einer zweiten über. Verwandle deine
        Instagram-Fotos in Kurzvideos für TikTok. Verwerte deinen langen YouTube-Content in einem LinkedIn-Post neu.
        Hol mehr aus derselben Idee in einem anderen Format heraus. <strong>Dein Produktionsaufwand verdoppelt sich, aber
        deine Wirkung vervielfacht sich um das Fünffache</strong>.
      </P>

      <H2>Schritt 6: Messen und verbessern</H2>
      <P>
        Eine persönliche Marke, die nicht gemessen wird, wächst nicht. Frag dich einmal im Monat:
      </P>
      <UL>
        <li>Welcher Content hat die meiste Interaktion erzielt?</li>
        <li>Welcher Social-Kanal hat die meisten Bio-Link-Klicks gebracht? (Miss es mit BeyLink BTAG)</li>
        <li>Welches Thema hat deine Leser/Zuschauer am stärksten zum Kommentieren gebracht?</li>
      </UL>

      <Callout tone="warn" title="Warnung: meide falsche Popularität">
        Follower kaufen, Bots und gefälschte Interaktion <strong>bringen dich auf lange Sicht um</strong>. Algorithmen
        erkennen es, und deine organische Reichweite sinkt. Langsames, aber echtes Wachstum gewinnt immer.
      </Callout>

      <H2>Fazit</H2>
      <P>
        Eine persönliche Marke entsteht nicht über Nacht, aber der <strong>richtige Start</strong> ist alles. Schreib
        heute deine Positionierung, teile morgen deinen ersten Content und richte am dritten Tag deine{' '}
        <A href="/register">BeyLink-Seite</A> ein und setze den Link überallhin. Wenn du 90 Tage später zurückblickst,
        wirst du den Unterschied selbst sehen.
      </P>
    </>
  );
}

function PostFr() {
  return (
    <>
      <P>
        « Marque personnelle » a été l'un des sujets les plus commentés de ces cinq dernières années. Pourtant, presque
        tout ce qui s'écrit à ce propos ne dépasse jamais les slogans creux. Dans ce guide, nous exposons 6 étapes
        pratiques qui font une <strong>vraie différence</strong> en un an, appuyées par de vrais exemples.
      </P>

      <H2>Pourquoi bâtir une marque personnelle ?</H2>
      <P>
        Le nom d'une entreprise peut disparaître d'un CV. Mais si <strong>votre nom</strong> est ce que les gens
        cherchent sur Google, vous êtes déjà une marque. Une marque personnelle :
      </P>
      <UL>
        <li>Ouvre la porte à des postes mieux rémunérés</li>
        <li>Réduit de 70 % votre temps de recherche d'emploi quand vous passez en freelance ou en conseil</li>
        <li>Vous permet de partager vos idées et d'inspirer d'autres personnes</li>
        <li>Crée une source de revenus indépendante de votre emploi principal (livres, cours, partenariats)</li>
      </UL>

      <H2>Étape 1 : le positionnement (qui, quoi, pour qui ?)</H2>
      <P>
        L'étape la plus négligée, et la plus importante. Répondez à ces trois questions :
      </P>
      <OL>
        <li><strong>Qui suis-je ?</strong> Un expert, un formateur, une source d'inspiration, un divertisseur ?</li>
        <li><strong>Que fais-je ?</strong> Design web, finances personnelles, cours de peinture, cuisine...</li>
        <li><strong>À qui je m'adresse ?</strong> Débutants, professionnels intermédiaires, cadres dirigeants ?</li>
      </OL>
      <P>
        Quand les réponses se rejoignent en une seule phrase, votre <strong>énoncé de positionnement</strong> apparaît.
        Par exemple :
      </P>
      <Callout>
        « Je crée du contenu pratique qui enseigne Figma aux designers web débutants. »
      </Callout>

      <H2>Étape 2 : creusez une seule plateforme</H2>
      <P>
        Tout le monde essaie d'être partout ; faites l'inverse. Choisissez la seule plateforme qui colle le mieux à
        votre positionnement :
      </P>
      <UL>
        <li><strong>LinkedIn :</strong> B2B, professionnels d'entreprise, consultants</li>
        <li><strong>Instagram :</strong> le visuel d'abord (design, mode, cuisine, voyage)</li>
        <li><strong>YouTube :</strong> formation format long, analyses techniques, vlogs</li>
        <li><strong>TikTok :</strong> vidéo courte, humour, astuces rapides, génération Z</li>
        <li><strong>X (Twitter) :</strong> idées, technologie, médias, échange</li>
      </UL>

      <H2>Étape 3 : fixez votre rythme de contenu</H2>
      <P>
        La régularité est le cœur d'une marque personnelle. Deux contenus vraiment bons par semaine battent cinq
        publications de remplissage par jour. Un rythme facile pour démarrer :
      </P>
      <UL>
        <li>Lundi : contenu pédagogique (comment faire)</li>
        <li>Mercredi : opinion/point de vue (votre regard sur un sujet)</li>
        <li>Vendredi : personnel/histoire (une expérience, un moment inspirant)</li>
      </UL>

      <InlineCta
        title="Montez un lien en bio pour votre marque personnelle"
        desc="Montrez tous vos réseaux sociaux, votre portfolio et vos contacts sur une seule page. Gratuit avec BeyLink."
        href="/register"
        label="Commencer gratuitement →"
      />

      <H2>Étape 4 : rassemblez votre présence numérique</H2>
      <P>
        Déplacer des abonnés d'un endroit à un autre est difficile. C'est pourquoi une{' '}
        <A href="/">page de lien en bio</A> doit être votre point d'ancrage numérique. Dans votre bio Instagram, sur
        votre profil LinkedIn, dans votre description YouTube, dans votre signature d'e-mail : partout le même lien unique.
      </P>
      <P>
        Cette page devrait inclure :
      </P>
      <UL>
        <li>Tous vos comptes de réseaux sociaux actifs</li>
        <li>Votre portfolio ou vos meilleurs travaux</li>
        <li>Un moyen de vous contacter (e-mail, WhatsApp, formulaire)</li>
        <li>Une inscription à la newsletter (de loin l'outil le plus important pour la valeur à long terme)</li>
        <li>Des liens vers tout cours, livre ou service payant que vous proposez</li>
      </UL>

      <H2>Étape 5 : diversifiez lentement</H2>
      <P>
        Au bout de 90 jours, une fois que vous êtes solide sur votre première plateforme, passez à une deuxième.
        Transformez vos photos Instagram en vidéos courtes pour TikTok. Recyclez votre long contenu YouTube en une
        publication LinkedIn. Tirez davantage de la même idée dans un format différent. <strong>Votre charge de
        production double, mais votre impact se multiplie par cinq</strong>.
      </P>

      <H2>Étape 6 : mesurez et améliorez</H2>
      <P>
        Une marque personnelle qui ne se mesure pas ne grandit pas. Une fois par mois, demandez-vous :
      </P>
      <UL>
        <li>Quel contenu a généré le plus d'engagement ?</li>
        <li>Quel canal social a apporté le plus de clics sur le lien en bio ? (Mesurez-le avec le BTAG de BeyLink)</li>
        <li>Quel sujet a le plus poussé vos lecteurs/spectateurs à commenter ?</li>
      </UL>

      <Callout tone="warn" title="Attention : fuyez la fausse popularité">
        Acheter des abonnés, les bots et le faux engagement <strong>vous tueront à long terme</strong>. Les algorithmes
        le détectent, et votre portée organique chute. Une croissance lente mais authentique gagne toujours.
      </Callout>

      <H2>Conclusion</H2>
      <P>
        Une marque personnelle ne se bâtit pas du jour au lendemain, mais le <strong>bon départ</strong> fait tout.
        Écrivez votre positionnement aujourd'hui, partagez votre premier contenu demain, et le troisième jour montez
        votre <A href="/register">page BeyLink</A> et glissez le lien partout. Quand vous regarderez en arrière 90 jours
        plus tard, vous verrez la différence par vous-même.
      </P>
    </>
  );
}

function PostPt() {
  return (
    <>
      <P>
        "Marca pessoal" foi um dos temas mais comentados dos últimos cinco anos. Só que quase tudo que se escreve sobre
        isso nunca passa de slogans vazios. Neste guia expomos 6 passos práticos que fazem uma <strong>diferença
        real</strong> em um ano, apoiados por exemplos reais.
      </P>

      <H2>Por que construir uma marca pessoal?</H2>
      <P>
        O nome de uma empresa pode sumir de um currículo. Mas se <strong>o seu nome</strong> é o que as pessoas buscam no
        Google, você já é uma marca. Uma marca pessoal:
      </P>
      <UL>
        <li>Abre a porta para vagas mais bem pagas</li>
        <li>Reduz em 70% o seu tempo de busca por trabalho quando você entra no freelance ou na consultoria</li>
        <li>Permite que você compartilhe suas ideias e inspire outras pessoas</li>
        <li>Cria uma fonte de renda independente do seu emprego principal (livros, cursos, patrocínios)</li>
      </UL>

      <H2>Passo 1: Posicionamento (quem, o quê, para quem?)</H2>
      <P>
        O passo mais ignorado e o mais importante. Responda a estas três perguntas:
      </P>
      <OL>
        <li><strong>Quem sou eu?</strong> Um especialista, um professor, um inspirador, um entretenedor?</li>
        <li><strong>O que eu faço?</strong> Design web, finanças pessoais, aulas de pintura, culinária...</li>
        <li><strong>Para quem eu falo?</strong> Iniciantes, profissionais de nível intermediário, executivos seniores?</li>
      </OL>
      <P>
        Quando as respostas se juntam em uma única frase, surge a sua <strong>declaração de posicionamento</strong>. Por exemplo:
      </P>
      <Callout>
        "Crio conteúdo prático que ensina Figma para designers web iniciantes."
      </Callout>

      <H2>Passo 2: Aprofunde em uma única plataforma</H2>
      <P>
        Todo mundo tenta estar em todo lugar; faça o contrário. Escolha a única plataforma que melhor combina com o seu posicionamento:
      </P>
      <UL>
        <li><strong>LinkedIn:</strong> B2B, profissionais corporativos, consultores</li>
        <li><strong>Instagram:</strong> o visual em primeiro lugar (design, moda, comida, viagem)</li>
        <li><strong>YouTube:</strong> educação de formato longo, aprofundamentos técnicos, vlogs</li>
        <li><strong>TikTok:</strong> vídeo curto, humor, dicas rápidas, Geração Z</li>
        <li><strong>X (Twitter):</strong> ideias, tecnologia, mídia, conversa</li>
      </UL>

      <H2>Passo 3: Defina o seu ritmo de conteúdo</H2>
      <P>
        Consistência é o coração de uma marca pessoal. Dois conteúdos genuinamente bons por semana batem cinco posts de
        enchimento por dia. Um ritmo fácil para começar:
      </P>
      <UL>
        <li>Segunda: conteúdo educativo (como fazer)</li>
        <li>Quarta: opinião/perspectiva (a sua visão sobre um assunto)</li>
        <li>Sexta: pessoal/história (uma experiência, um momento inspirador)</li>
      </UL>

      <InlineCta
        title="Monte um link na bio para a sua marca pessoal"
        desc="Mostre todas as suas redes sociais, seu portfólio e seu contato em uma página. Grátis com o BeyLink."
        href="/register"
        label="Comece grátis →"
      />

      <H2>Passo 4: Consolide a sua presença digital</H2>
      <P>
        Mover seguidores de um lugar para outro é difícil. É por isso que uma <A href="/">página de link na bio</A> deve
        ser o seu centro digital. Na sua bio do Instagram, no seu perfil do LinkedIn, na sua descrição do YouTube, na sua
        assinatura de e-mail: sempre o mesmo link único.
      </P>
      <P>
        Essa página deve incluir:
      </P>
      <UL>
        <li>Todas as suas contas ativas de redes sociais</li>
        <li>Seu portfólio ou seus melhores trabalhos</li>
        <li>Uma forma de contato (e-mail, WhatsApp, formulário)</li>
        <li>Uma inscrição na newsletter (de longe a ferramenta mais importante para valor de longo prazo)</li>
        <li>Links para qualquer curso, livro ou serviço pago que você oferece</li>
      </UL>

      <H2>Passo 5: Diversifique aos poucos</H2>
      <P>
        Depois de 90 dias, quando você já estiver forte na sua primeira plataforma, passe para uma segunda. Transforme suas
        fotos do Instagram em vídeos curtos para o TikTok. Reaproveite o seu conteúdo longo do YouTube em um post do
        LinkedIn. Tire mais proveito da mesma ideia em um formato diferente. <strong>Sua carga de produção dobra, mas o seu
        impacto se multiplica por cinco</strong>.
      </P>

      <H2>Passo 6: Meça e melhore</H2>
      <P>
        Uma marca pessoal que não é medida não cresce. Uma vez por mês, pergunte:
      </P>
      <UL>
        <li>Qual conteúdo gerou mais engajamento?</li>
        <li>Qual canal social trouxe mais cliques no link da bio? (Meça isso com o BTAG do BeyLink)</li>
        <li>Qual tema mais empurrou seus leitores/espectadores a comentar?</li>
      </UL>

      <Callout tone="warn" title="Aviso: fuja da popularidade falsa">
        Comprar seguidores, bots e engajamento falso <strong>vão te matar no longo prazo</strong>. Os algoritmos percebem,
        e o seu alcance orgânico cai. Crescimento lento, mas genuíno, sempre vence.
      </Callout>

      <H2>Conclusão</H2>
      <P>
        Uma marca pessoal não se constrói do dia para a noite, mas o <strong>começo certo</strong> é tudo. Escreva o seu
        posicionamento hoje, compartilhe o seu primeiro conteúdo amanhã e, no terceiro dia, monte a sua
        <A href="/register"> página BeyLink</A> e coloque o link em todo lugar. Quando você olhar para trás 90 dias depois,
        vai ver a diferença com os próprios olhos.
      </P>
    </>
  );
}

function PostIt() {
  return (
    <>
      <P>
        "Brand personale" è stato uno degli argomenti più discussi degli ultimi cinque anni. Eppure gran parte di ciò
        che se ne scrive non va oltre gli slogan vuoti. In questa guida presentiamo 6 passi pratici che fanno una
        <strong> differenza reale</strong> nel giro di un anno, con esempi concreti.
      </P>

      <H2>Perché costruire un brand personale?</H2>
      <P>
        Il nome di un'azienda può sparire da un curriculum. Ma se è <strong>il tuo nome</strong> quello che le persone
        cercano su Google, sei già un brand. Un brand personale:
      </P>
      <UL>
        <li>Apre la porta a ruoli più pagati</li>
        <li>Riduce del 70% i tempi di ricerca del lavoro quando passi al freelance o alla consulenza</li>
        <li>Ti permette di condividere le tue idee e ispirare altre persone</li>
        <li>Crea un flusso di reddito indipendente dal tuo lavoro (libri, corsi, sponsorizzazioni)</li>
      </UL>

      <H2>Passo 1: posizionamento (chi, cosa, per chi?)</H2>
      <P>
        Il passo più trascurato, e il più importante. Rispondi a queste tre domande:
      </P>
      <OL>
        <li><strong>Chi sono?</strong> Un esperto, un insegnante, un ispiratore, un intrattenitore?</li>
        <li><strong>Cosa faccio?</strong> Web design, finanza personale, lezioni di pittura, cucina...</li>
        <li><strong>A chi mi rivolgo?</strong> Principianti, professionisti mid-level, dirigenti senior?</li>
      </OL>
      <P>
        Quando le risposte si uniscono in una sola frase, emerge la tua <strong>dichiarazione di posizionamento</strong>. Per esempio:
      </P>
      <Callout>
        "Creo contenuti pratici che insegnano Figma ai web designer alle prime armi."
      </Callout>

      <H2>Passo 2: approfondisci su una sola piattaforma</H2>
      <P>
        Tutti cercano di essere ovunque; fai il contrario. Scegli l'unica piattaforma che si adatta meglio al tuo posizionamento:
      </P>
      <UL>
        <li><strong>LinkedIn:</strong> B2B, professionisti aziendali, consulenti</li>
        <li><strong>Instagram:</strong> visivo prima di tutto (design, moda, cibo, viaggi)</li>
        <li><strong>YouTube:</strong> formazione in formato lungo, approfondimenti tecnici, vlog</li>
        <li><strong>TikTok:</strong> video brevi, comicità, consigli rapidi, Gen Z</li>
        <li><strong>X (Twitter):</strong> idee, tecnologia, media, conversazione</li>
      </UL>

      <H2>Passo 3: definisci il tuo ritmo di contenuti</H2>
      <P>
        La coerenza è il cuore di un brand personale. Due contenuti davvero buoni a settimana battono cinque post di
        riempimento al giorno. Un ritmo facile per iniziare:
      </P>
      <UL>
        <li>Lunedì: contenuto educativo (come si fa)</li>
        <li>Mercoledì: opinione/punto di vista (la tua idea su un tema)</li>
        <li>Venerdì: personale/storia (un'esperienza, un momento ispirante)</li>
      </UL>

      <InlineCta
        title="Crea un link in bio per il tuo brand personale"
        desc="Mostra tutti i tuoi social, il portfolio e i contatti in un'unica pagina. Gratis con BeyLink."
        href="/register"
        label="Inizia gratis →"
      />

      <H2>Passo 4: unifica la tua presenza digitale</H2>
      <P>
        Spostare i follower da un posto a un altro è difficile. Ecco perché una <A href="/">pagina link in bio</A> deve
        essere il tuo centro digitale. Nella tua bio Instagram, sul profilo LinkedIn, nella descrizione YouTube, nella
        firma e-mail, sempre lo stesso unico link.
      </P>
      <P>
        Questa pagina dovrebbe includere:
      </P>
      <UL>
        <li>Tutti i tuoi account social attivi</li>
        <li>Il tuo portfolio o i tuoi lavori migliori</li>
        <li>Un modo per contattarti (e-mail, WhatsApp, modulo)</li>
        <li>Un'iscrizione alla newsletter (lo strumento più importante per il valore a lungo termine)</li>
        <li>Link a eventuali corsi, libri o servizi a pagamento che offri</li>
      </UL>

      <H2>Passo 5: diversifica lentamente</H2>
      <P>
        Dopo 90 giorni, quando sei forte sulla tua prima piattaforma, passa a una seconda. Trasforma le tue foto
        Instagram in video brevi per TikTok. Riadatta i tuoi contenuti lunghi di YouTube in un post LinkedIn. Sfrutta di
        più la stessa idea in un formato diverso. <strong>Il tuo carico di produzione raddoppia, ma il tuo impatto si
        moltiplica per cinque</strong>.
      </P>

      <H2>Passo 6: misura e migliora</H2>
      <P>
        Un brand personale che non si misura non cresce. Una volta al mese, chiediti:
      </P>
      <UL>
        <li>Quale contenuto ha ottenuto più coinvolgimento?</li>
        <li>Quale canale social ha portato più clic al link in bio? (Misuralo con il BTAG di BeyLink)</li>
        <li>Quale argomento ha spinto di più i tuoi lettori/spettatori a commentare?</li>
      </UL>

      <Callout tone="warn" title="Attenzione: sta' lontano dalla popolarità finta">
        Comprare follower, bot e coinvolgimento fasullo <strong>ti ucciderà nel lungo periodo</strong>. Gli algoritmi lo
        riconoscono, e la tua portata organica crolla. Una crescita lenta ma autentica vince sempre.
      </Callout>

      <H2>Conclusione</H2>
      <P>
        Un brand personale non si costruisce in una notte, ma la <strong>partenza giusta</strong> è tutto. Scrivi il tuo
        posizionamento oggi, condividi il tuo primo contenuto domani e il terzo giorno crea la tua
        <A href="/register"> pagina BeyLink</A> e metti il link ovunque. Quando ti guarderai indietro dopo 90 giorni,
        vedrai la differenza con i tuoi occhi.
      </P>
    </>
  );
}

function PostJa() {
  return (
    <>
      <P>
        「個人ブランド」は、この5年で最も語られてきたテーマの1つです。それでも、書かれていることの多くは空虚なスローガンの域を出ません。
        このガイドでは、1年のうちに<strong>本当の差</strong>を生む6つの実践ステップを、実例とともに示します。
      </P>

      <H2>なぜ個人ブランドを作るのか？</H2>
      <P>
        会社名は履歴書から消えることがあります。でも、人々がGoogleで検索するのが<strong>あなたの名前</strong>なら、あなたはすでにブランドです。
        個人ブランドは、
      </P>
      <UL>
        <li>より高い報酬の仕事への扉を開く</li>
        <li>フリーランスやコンサルに進むとき、仕事探しの時間を70%短くする</li>
        <li>自分の考えを発信し、ほかの人を刺激できるようにする</li>
        <li>本業とは別の収入源を築く（書籍、講座、スポンサー）</li>
      </UL>

      <H2>ステップ1：ポジショニング（誰が、何を、誰のために？）</H2>
      <P>
        最も見過ごされがちで、最も重要なステップです。次の3つの問いに答えましょう。
      </P>
      <OL>
        <li><strong>私は何者か？</strong>専門家、先生、刺激を与える人、楽しませる人？</li>
        <li><strong>私は何をするのか？</strong>Webデザイン、家計管理、絵画レッスン、料理…</li>
        <li><strong>私は誰に語りかけるのか？</strong>初心者、中堅のプロ、上級の経営層？</li>
      </OL>
      <P>
        その答えが一文にまとまったとき、あなたの<strong>ポジショニングステートメント</strong>が生まれます。たとえば、
      </P>
      <Callout>
        「初心者のWebデザイナーにFigmaを教える、実践的なコンテンツを作っています。」
      </Callout>

      <H2>ステップ2：1つのプラットフォームを深掘りする</H2>
      <P>
        みんなが「どこにでもいよう」とします。あなたはその逆をしましょう。自分のポジショニングに最も合う1つのプラットフォームを選びます。
      </P>
      <UL>
        <li><strong>LinkedIn：</strong>B2B、企業のプロフェッショナル、コンサルタント</li>
        <li><strong>Instagram：</strong>ビジュアル優先（デザイン、ファッション、料理、旅行）</li>
        <li><strong>YouTube：</strong>長尺の教育、技術の深掘り、vlog</li>
        <li><strong>TikTok：</strong>短尺動画、ユーモア、手早いコツ、Z世代</li>
        <li><strong>X（Twitter）：</strong>アイデア、テクノロジー、メディア、対話</li>
      </UL>

      <H2>ステップ3：コンテンツのリズムを決める</H2>
      <P>
        一貫性こそ、個人ブランドの心臓です。本当に良い投稿を週2本のほうが、埋め草の投稿を1日5本より勝ります。
        始めやすいリズムはこちらです。
      </P>
      <UL>
        <li>月曜：教育コンテンツ（ハウツー）</li>
        <li>水曜：意見・視点（あるテーマについてのあなたの見解）</li>
        <li>金曜：個人・物語（体験、心を動かした瞬間）</li>
      </UL>

      <InlineCta
        title="個人ブランドのためのプロフィールリンクを用意する"
        desc="すべてのSNS、ポートフォリオ、連絡先を1ページで見せられます。BeyLinkなら無料。"
        href="/register"
        label="無料で始める →"
      />

      <H2>ステップ4：デジタルでの存在感を1つにまとめる</H2>
      <P>
        フォロワーをある場所から別の場所へ移すのは難しいものです。だからこそ、<A href="/">プロフィールリンクのページ</A>を
        あなたのデジタルの拠点にすべきなのです。Instagramのプロフィール、LinkedInのプロフィール、YouTubeの概要欄、メールの署名。
        すべて同じ、1つのリンクで。
      </P>
      <P>
        このページには、次のものを入れましょう。
      </P>
      <UL>
        <li>活動中のすべてのSNSアカウント</li>
        <li>ポートフォリオ、または自信のある実績</li>
        <li>連絡手段（メール、WhatsApp、フォーム）</li>
        <li>ニュースレターの登録（長期的な価値のための、最も重要なツール）</li>
        <li>提供している講座、書籍、有料サービスへのリンク</li>
      </UL>

      <H2>ステップ5：ゆっくり広げる</H2>
      <P>
        90日たって、最初のプラットフォームで強くなったら、2つ目に移りましょう。Instagramの写真をTikTok向けの短尺動画に変える。
        YouTubeの長尺コンテンツをLinkedInの投稿に作り直す。同じアイデアを、別の形式でもっと活かすのです。
        <strong>制作の負荷は2倍になりますが、インパクトは5倍にふくらみます</strong>。
      </P>

      <H2>ステップ6：計測して改善する</H2>
      <P>
        計測されない個人ブランドは伸びません。月に1度、こう問いましょう。
      </P>
      <UL>
        <li>どのコンテンツが最も高いエンゲージメントを得たか？</li>
        <li>どのSNSチャネルが最も多くのプロフィールリンクのクリックを生んだか？（BeyLinkのBTAGで計測しましょう）</li>
        <li>どのテーマが、読者や視聴者を最もコメントに駆り立てたか？</li>
      </UL>

      <Callout tone="warn" title="注意：見せかけの人気を避ける">
        フォロワーの購入、ボット、偽のエンゲージメントは、<strong>長い目で見ればあなたを滅ぼします</strong>。アルゴリズムはそれを見抜き、
        オーガニックのリーチが下がります。ゆっくりでも本物の成長が、つねに勝ちます。
      </Callout>

      <H2>まとめ</H2>
      <P>
        個人ブランドは一夜にして築けませんが、<strong>正しいスタート</strong>がすべてです。今日ポジショニングを書き、明日は最初のコンテンツを出し、
        3日目には<A href="/register">BeyLinkのページ</A>を用意して、あちこちにリンクを置きましょう。90日後に振り返れば、その差をあなた自身の目で確かめられます。
      </P>
    </>
  );
}

export default function Post() {
  const { lang } = useLanguage();
  return lang === 'ja' ? <PostJa /> : lang === 'it' ? <PostIt /> : lang === 'pt' ? <PostPt /> : lang === 'fr' ? <PostFr /> : lang === 'de' ? <PostDe /> : lang === 'ru' ? <PostRu /> : lang === 'es' ? <PostEs /> : lang === 'en' ? <PostEn /> : <PostTr />;
}
