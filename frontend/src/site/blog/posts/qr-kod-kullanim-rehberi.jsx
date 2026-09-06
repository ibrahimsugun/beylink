import { H2, H3, P, UL, OL, A, Callout, InlineCta } from '../PostBody.jsx';
import { useLanguage } from '../../../context/LanguageContext.jsx';

export const meta = {
  slug: 'qr-code-guide',
  title: {
    tr: 'QR Kod Kullanım Rehberi: Ofline ile Onlinei Birleştir',
    en: 'QR Code Guide: Bridge Your Offline and Online World',
    ru: 'Гид по QR-кодам: соедините офлайн и онлайн',
    es: 'Guía de códigos QR: une tu mundo offline y online',
    de: 'QR-Code-Guide: Offline und Online verbinden',
    fr: 'Guide des QR codes : relier hors ligne et en ligne',
    pt: 'Guia de código QR: una o mundo offline e online',
    it: 'Guida ai codici QR: unisci offline e online',
    ja: 'QRコード活用ガイド：オフラインとオンラインをつなぐ',
  },
  description: {
    tr: 'QR kodu nerede, nasıl ve neden kullanmalısın? Kartvizit, poster, menü, vitrin, etkinlik — 8 senaryoyla pratik rehber.',
    en: 'Where, how, and why should you use a QR code? Business cards, posters, menus, storefronts, events: a practical guide with 8 scenarios.',
    ru: 'Где, как и зачем использовать QR-код? Визитки, постеры, меню, витрины, мероприятия: практическое руководство с 8 сценариями.',
    es: '¿Dónde, cómo y por qué usar un código QR? Tarjetas de visita, carteles, menús, escaparates y eventos: una guía práctica con 8 escenarios.',
    de: 'Wo, wie und warum solltest du einen QR-Code einsetzen? Visitenkarten, Poster, Speisekarten, Schaufenster, Events: ein praktischer Guide mit 8 Szenarien.',
    fr: 'Où, comment et pourquoi utiliser un QR code ? Cartes de visite, affiches, menus, vitrines, événements : un guide pratique avec 8 scénarios.',
    pt: 'Onde, como e por que usar um código QR? Cartões de visita, cartazes, cardápios, vitrines, eventos: um guia prático com 8 cenários.',
    it: 'Dove, come e perché usare un codice QR? Biglietti da visita, poster, menu, vetrine, eventi: una guida pratica con 8 scenari.',
    ja: 'QRコードをどこで、どう、なぜ使うべきか。名刺、ポスター、メニュー、店頭、イベントなど、8つのシナリオで学ぶ実践ガイドです。',
  },
  category: 'araclar',
  tags: {
    tr: ['qr kod', 'ofline', 'pazarlama', 'link'],
    en: ['qr code', 'offline', 'marketing', 'link'],
    ru: ['qr-код', 'офлайн', 'маркетинг', 'ссылка'],
    es: ['código qr', 'offline', 'marketing', 'enlace'],
    de: ['qr-code', 'offline', 'marketing', 'link'],
    fr: ['qr code', 'hors ligne', 'marketing', 'lien'],
    pt: ['código qr', 'offline', 'marketing', 'link'],
    it: ['codice qr', 'offline', 'marketing', 'link'],
    ja: ['qrコード', 'オフライン', 'マーケティング', 'リンク'],
  },
  publishedAt: '2026-07-07',
  updatedAt: '2026-07-07',
  readingMinutes: 6,
  image: '/og-image.png',
  faq: {
    tr: [
      { q: 'QR kod nasıl okunur?', a: 'Neredeyse tüm modern telefonlar (iOS 11+, Android 8+) kamera açıldığında QR kodu otomatik algılar ve tıklanabilir bir link olarak gösterir. Ayrı bir uygulama gerekmez.' },
      { q: 'QR kodun ömrü ne kadar?', a: 'BeyLink QR kodları dinamiktir — profil URL\'in değişse bile QR aynı kalır. Statik QR kodlar (URL doğrudan gömülü) linkin ömrü boyunca çalışır.' },
      { q: 'QR kodun boyutu ne olmalı?', a: 'Baskıda minimum 2x2 cm, dijital ekranda 200x200px önerilir. Dış mekan afişlerde 10x10 cm ideal.' },
    ],
    en: [
      { q: 'How do you scan a QR code?', a: 'Almost all modern phones (iOS 11+, Android 8+) detect a QR code automatically when you open the camera and show it as a clickable link. No separate app needed.' },
      { q: 'How long does a QR code last?', a: 'BeyLink QR codes are dynamic: even if your profile URL changes, the QR stays the same. Static QR codes (with the URL embedded directly) work for the life of the link.' },
      { q: 'What size should a QR code be?', a: 'A minimum of 2x2 cm in print and 200x200px on a digital screen is recommended. For outdoor posters, 10x10 cm is ideal.' },
    ],
    ru: [
      { q: 'Как сканировать QR-код?', a: 'Почти все современные телефоны (iOS 11+, Android 8+) распознают QR-код автоматически при открытии камеры и показывают его как кликабельную ссылку. Отдельное приложение не нужно.' },
      { q: 'Сколько живёт QR-код?', a: 'QR-коды BeyLink динамические: даже если URL вашего профиля меняется, QR остаётся прежним. Статические QR-коды (с зашитым напрямую URL) работают в течение всей жизни ссылки.' },
      { q: 'Каким должен быть размер QR-кода?', a: 'Рекомендуется минимум 2x2 см в печати и 200x200 px на цифровом экране. Для уличных постеров идеально 10x10 см.' },
    ],
    es: [
      { q: '¿Cómo se escanea un código QR?', a: 'Casi todos los teléfonos modernos (iOS 11+, Android 8+) detectan un código QR automáticamente al abrir la cámara y lo muestran como un enlace clicable. No hace falta una app aparte.' },
      { q: '¿Cuánto dura un código QR?', a: 'Los códigos QR de BeyLink son dinámicos: aunque cambie la URL de tu perfil, el QR sigue igual. Los códigos QR estáticos (con la URL incrustada directamente) funcionan durante toda la vida del enlace.' },
      { q: '¿Qué tamaño debería tener un código QR?', a: 'Se recomienda un mínimo de 2x2 cm en impresión y 200x200 px en pantalla digital. Para carteles de exterior, 10x10 cm es lo ideal.' },
    ],
    de: [
      { q: 'Wie scannt man einen QR-Code?', a: 'Fast alle modernen Handys (iOS 11+, Android 8+) erkennen einen QR-Code automatisch, sobald du die Kamera öffnest, und zeigen ihn als klickbaren Link an. Eine separate App ist nicht nötig.' },
      { q: 'Wie lange hält ein QR-Code?', a: 'BeyLink-QR-Codes sind dynamisch: Selbst wenn sich deine Profil-URL ändert, bleibt der QR gleich. Statische QR-Codes (mit direkt eingebetteter URL) funktionieren über die gesamte Lebensdauer des Links.' },
      { q: 'Wie groß sollte ein QR-Code sein?', a: 'Empfohlen sind mindestens 2x2 cm im Druck und 200x200 px auf einem digitalen Bildschirm. Für Außenposter sind 10x10 cm ideal.' },
    ],
    fr: [
      { q: 'Comment scanne-t-on un QR code ?', a: 'Presque tous les téléphones modernes (iOS 11+, Android 8+) détectent un QR code automatiquement à l\'ouverture de l\'appareil photo et l\'affichent comme un lien cliquable. Aucune application séparée n\'est nécessaire.' },
      { q: 'Combien de temps dure un QR code ?', a: 'Les QR codes de BeyLink sont dynamiques : même si l\'URL de votre profil change, le QR reste le même. Les QR codes statiques (avec l\'URL intégrée directement) fonctionnent pendant toute la durée de vie du lien.' },
      { q: 'Quelle taille doit avoir un QR code ?', a: 'On recommande au minimum 2x2 cm en impression et 200x200 px sur un écran numérique. Pour les affiches extérieures, 10x10 cm est l\'idéal.' },
    ],
    pt: [
      { q: 'Como se escaneia um código QR?', a: 'Quase todos os celulares modernos (iOS 11+, Android 8+) detectam um código QR automaticamente ao abrir a câmera e o mostram como um link clicável. Não precisa de um app separado.' },
      { q: 'Quanto tempo dura um código QR?', a: 'Os códigos QR do BeyLink são dinâmicos: mesmo que a URL do seu perfil mude, o QR continua o mesmo. Códigos QR estáticos (com a URL embutida diretamente) funcionam por toda a vida do link.' },
      { q: 'Qual deve ser o tamanho de um código QR?', a: 'Recomenda-se no mínimo 2x2 cm na impressão e 200x200 px em tela digital. Para cartazes externos, 10x10 cm é o ideal.' },
    ],
    it: [
      { q: 'Come si scansiona un codice QR?', a: 'Quasi tutti i telefoni moderni (iOS 11+, Android 8+) rilevano un codice QR in automatico quando apri la fotocamera e lo mostrano come un link cliccabile. Non serve un\'app separata.' },
      { q: 'Quanto dura un codice QR?', a: 'I codici QR di BeyLink sono dinamici: anche se l\'URL del tuo profilo cambia, il QR resta lo stesso. I codici QR statici (con l\'URL incorporato direttamente) funzionano per tutta la vita del link.' },
      { q: 'Che dimensioni deve avere un codice QR?', a: 'Si consiglia un minimo di 2x2 cm in stampa e 200x200 px su uno schermo digitale. Per i poster da esterno, 10x10 cm è l\'ideale.' },
    ],
    ja: [
      { q: 'QRコードはどうやって読み取りますか？', a: 'ほぼすべての最近のスマートフォン（iOS 11以降、Android 8以降）は、カメラを開くだけでQRコードを自動で認識し、クリックできるリンクとして表示します。専用アプリは不要です。' },
      { q: 'QRコードの寿命はどのくらいですか？', a: 'BeyLinkのQRコードは動的です。プロフィールのURLが変わっても、QRはそのまま。静的なQRコード（URLを直接埋め込んだもの）は、そのリンクが生きている間ずっと機能します。' },
      { q: 'QRコードのサイズはどのくらいがいいですか？', a: '印刷では最低2×2cm、デジタル画面では200×200pxが推奨です。屋外のポスターなら10×10cmが理想です。' },
    ],
  },
};

function PostTr() {
  return (
    <>
      <P>
        QR kod, pandemi ile ikinci baharını yaşadı ama artık günlük hayatın bir parçası. Menülerden vitrinlere,
        kartvizitten poster'lere kadar her yerde. Peki sen QR'ı gerçekten <strong>etkili</strong> kullanıyor musun?
        Bu rehberde 8 pratik senaryoyu ve QR kod stratejisini anlatıyoruz.
      </P>

      <H2>Neden QR kod?</H2>
      <P>
        Ofline dünya ile online'ı köprüleyen en basit teknoloji. Bir insan afişindeki QR kodu telefonuyla okuduğunda,
        <strong> senin sayfana anında ulaşır</strong>. Manuel adres yazmak, aramak yok. 2 saniye içinde etkileşim.
      </P>

      <Callout tone="info" title="QR ne değil?">
        QR sihirli bir dönüşüm aracı değil. QR sadece <strong>tıklamayı hızlandıran</strong> bir kısayol. Asıl mucizeyi
        QR'ın yönlendirdiği <A href="/">link-in-bio sayfası</A> yapar.
      </Callout>

      <H2>8 pratik QR senaryosu</H2>

      <H3>1. Kartvizit arkası</H3>
      <P>
        Klasik kartvizitin arka yüzüne QR kod bas. Ziyaretçi kartını attıktan sonra bile QR'ı okuyarak seni bulabilir.
        BeyLink QR kodları A4 baskıda net görünecek çözünürlükte üretilir.
      </P>

      <H3>2. Restoran menüsü</H3>
      <P>
        Masa üstü menü kartı yerine QR ile dijital menü aç. Avantajlar:
      </P>
      <UL>
        <li>Menü güncellemesi ücretsiz (baskı maliyeti yok)</li>
        <li>Görsel eklenebilir (yemek fotoğrafları)</li>
        <li>Alerjen bilgisi kolay güncellenir</li>
        <li>Online sipariş linkine bağlanabilir</li>
      </UL>

      <H3>3. Etkinlik/konferans yaka kartı</H3>
      <P>
        Katılımcı yaka kartında kişisel LinkedIn/BeyLink QR'ı — networking'in en hızlı yolu. İki insan buluşuyor,
        birbirlerinin QR'ını okuyor, sosyal medyaya karşılıklı ekleme oluyor.
      </P>

      <H3>4. Vitrin ve poster</H3>
      <P>
        Mağaza kapatık olsa bile vitrindeki QR kod ziyaretçiye e-ticaret sitene ya da sosyal medyana ulaşım sağlar.
        Gece bile satış potansiyeli.
      </P>

      <H3>5. Ürün paketi</H3>
      <P>
        Ürün ambalajında QR — kullanım kılavuzu, garanti kaydı, ilgili aksesuar önerisi. Müşteri sadakat programına
        da yönlendirebilirsin.
      </P>

      <InlineCta
        title="Sayfan için QR kod oluştur"
        desc="BeyLink her profilde otomatik yüksek çözünürlüklü QR üretir. Ücretsiz plan yeterli."
        href="/register"
        label="Hemen Oluştur →"
      />

      <H3>6. Sunum slaytları</H3>
      <P>
        Sunumun son slaytında "Beni takip et" yerine QR kod koy. Dinleyici anında sosyal medyana ulaşır. Konferansta
        oturumun kalabalıksa, mikrofona ulaşamayan da seni bulur.
      </P>

      <H3>7. E-posta imzası</H3>
      <P>
        Kurumsal e-posta imzasında küçük bir QR — profesyonel görünüm + kolay erişim. Alıcı seni sosyal medyada
        hızlıca bulur.
      </P>

      <H3>8. Kampanya afişleri (dış mekan)</H3>
      <P>
        Otobüs durağı, metro, alışveriş merkezi afişleri — büyük QR kodları uzaktan bile okunur. Kampanya sayfana
        anında yönlendirme.
      </P>

      <H2>QR başarısı için 5 kural</H2>
      <OL>
        <li><strong>Yönlendirdiğin sayfa mobil optimize olsun</strong> — %98'i telefonla açar</li>
        <li><strong>Sayfa hızlı yüklensin</strong> — 3 saniye kuralı</li>
        <li><strong>QR'ı bağlam içinde göster</strong> — "Menü için okut" gibi net çağrı</li>
        <li><strong>Yeterince büyük yap</strong> — minimum 2x2 cm, uzaktan görünecekse daha büyük</li>
        <li><strong>Test et</strong> — baskı sonrası mutlaka farklı telefonlarla oku</li>
      </OL>

      <Callout tone="warn" title="Kontrast önemli">
        QR'ın siyah kısmı beyaz zeminde olmalı. Renkli QR trend ama <strong>kontrast düşerse okuma başarısızlığı</strong>{' '}
        artar. Sanatsal QR kodlarına dikkat.
      </Callout>

      <H2>Sonuç</H2>
      <P>
        QR kod ofline ile online arasındaki köprü. Ama köprünün ötesinde iyi bir <A href="/">link-in-bio sayfası</A>{' '}
        olmalı. BeyLink her sayfa için ücretsiz otomatik QR üretir — sen sadece nerede kullanacağını seç.
      </P>
      <P>
        <A href="/register">Ücretsiz sayfanı aç</A>, QR'ını indir, ilk kartvizit siparişini ver.
      </P>
    </>
  );
}

function PostEn() {
  return (
    <>
      <P>
        The QR code enjoyed a second spring during the pandemic, and it's now part of everyday life: from menus to
        storefronts, business cards to posters, it's everywhere. But are you really using QR codes
        <strong> effectively</strong>? In this guide we cover 8 practical scenarios and a QR code strategy.
      </P>

      <H2>Why a QR code?</H2>
      <P>
        It's the simplest technology for bridging the offline and online worlds. When someone scans the QR code on a
        poster with their phone, they <strong>reach your page instantly</strong>. No typing addresses, no searching.
        Engagement in two seconds.
      </P>

      <Callout tone="info" title="What QR isn't">
        A QR code is not a magic conversion tool. It's just a shortcut that <strong>speeds up the click</strong>. The
        real magic happens on the <A href="/">link-in-bio page</A> the QR points to.
      </Callout>

      <H2>8 practical QR scenarios</H2>

      <H3>1. The back of a business card</H3>
      <P>
        Print a QR code on the back of your classic business card. Even after a visitor tosses the card, they can still
        find you by scanning the QR. BeyLink QR codes are generated at a resolution that stays crisp in A4 print.
      </P>

      <H3>2. Restaurant menus</H3>
      <P>
        Swap the tabletop menu card for a digital menu via QR. The advantages:
      </P>
      <UL>
        <li>Menu updates are free (no printing costs)</li>
        <li>You can add images (food photos)</li>
        <li>Allergen info is easy to keep current</li>
        <li>It can link to an online ordering page</li>
      </UL>

      <H3>3. Event/conference badges</H3>
      <P>
        A personal LinkedIn/BeyLink QR on an attendee badge, the fastest way to network. Two people meet, scan each
        other's QR, and follow one another on social media in seconds.
      </P>

      <H3>4. Storefronts and posters</H3>
      <P>
        Even when the store is closed, a QR code in the window sends visitors to your e-commerce site or social media.
        Sales potential even at night.
      </P>

      <H3>5. Product packaging</H3>
      <P>
        A QR on product packaging: user manual, warranty registration, related accessory suggestions. You can also
        route people to your customer loyalty program.
      </P>

      <InlineCta
        title="Create a QR code for your page"
        desc="BeyLink generates a high-resolution QR automatically for every profile. The free plan is enough."
        href="/register"
        label="Create Now →"
      />

      <H3>6. Presentation slides</H3>
      <P>
        On your final slide, put a QR code instead of "Follow me." The audience reaches your social media instantly. If
        the session is crowded, even those who can't get to the mic can find you.
      </P>

      <H3>7. Email signatures</H3>
      <P>
        A small QR in your corporate email signature, a professional look plus easy access. The recipient finds you on
        social media in a flash.
      </P>

      <H3>8. Campaign posters (outdoor)</H3>
      <P>
        Bus stops, subway stations, mall posters. Large QR codes are readable even from a distance. Instant routing to
        your campaign page.
      </P>

      <H2>5 rules for QR success</H2>
      <OL>
        <li><strong>Make sure the destination page is mobile-optimized</strong> (98% open it on a phone)</li>
        <li><strong>Keep the page fast-loading</strong>: the 3-second rule</li>
        <li><strong>Show the QR in context</strong>, with a clear call like "Scan for the menu"</li>
        <li><strong>Make it big enough</strong> (minimum 2x2 cm, larger if it needs to be seen from afar)</li>
        <li><strong>Test it</strong>: after printing, always scan with a few different phones</li>
      </OL>

      <Callout tone="warn" title="Contrast matters">
        The dark part of the QR should sit on a white background. Colorful QR codes are trendy, but{' '}
        <strong>as contrast drops, scan failures rise</strong>. Be careful with artistic QR codes.
      </Callout>

      <H2>Conclusion</H2>
      <P>
        A QR code is the bridge between offline and online. But beyond that bridge there needs to be a solid{' '}
        <A href="/">link-in-bio page</A>. BeyLink generates a free QR automatically for every page; you just choose
        where to use it.
      </P>
      <P>
        <A href="/register">Create your free page</A>, download your QR, and place your first business card order.
      </P>
    </>
  );
}

function PostRu() {
  return (
    <>
      <P>
        QR-код пережил вторую весну во время пандемии, и теперь он часть повседневной жизни: от меню до витрин, от визиток
        до постеров, он повсюду. Но используете ли вы QR-коды действительно <strong>эффективно</strong>? В этом
        руководстве мы разберём 8 практических сценариев и стратегию QR-кодов.
      </P>

      <H2>Зачем нужен QR-код?</H2>
      <P>
        Это простейшая технология, соединяющая офлайн и онлайн миры. Когда кто-то сканирует QR-код на постере телефоном,
        он <strong>мгновенно попадает на вашу страницу</strong>. Не нужно набирать адреса, не нужно искать.
        Взаимодействие за две секунды.
      </P>

      <Callout tone="info" title="Чем QR не является">
        QR-код это не волшебный инструмент конверсии. Это лишь ярлык, который <strong>ускоряет клик</strong>. Настоящее
        волшебство происходит на <A href="/">странице ссылки в био</A>, на которую ведёт QR.
      </Callout>

      <H2>8 практических сценариев QR</H2>

      <H3>1. Обратная сторона визитки</H3>
      <P>
        Напечатайте QR-код на обороте классической визитки. Даже если посетитель выбросит карточку, он всё равно сможет
        найти вас, отсканировав QR. QR-коды BeyLink создаются в разрешении, которое остаётся чётким при печати A4.
      </P>

      <H3>2. Меню ресторана</H3>
      <P>
        Замените настольную карту меню на цифровое меню через QR. Преимущества:
      </P>
      <UL>
        <li>Обновление меню бесплатно (нет расходов на печать)</li>
        <li>Можно добавить изображения (фото блюд)</li>
        <li>Информацию об аллергенах легко держать актуальной</li>
        <li>Можно связать со страницей онлайн-заказа</li>
      </UL>

      <H3>3. Бейджи на мероприятиях/конференциях</H3>
      <P>
        Личный QR LinkedIn/BeyLink на бейдже участника это самый быстрый способ завести контакты. Два человека
        встречаются, сканируют QR друг друга и подписываются друг на друга в соцсетях за секунды.
      </P>

      <H3>4. Витрины и постеры</H3>
      <P>
        Даже когда магазин закрыт, QR-код в витрине отправляет посетителей на ваш интернет-магазин или в соцсети.
        Потенциал продаж даже ночью.
      </P>

      <H3>5. Упаковка товара</H3>
      <P>
        QR на упаковке товара: инструкция, регистрация гарантии, предложения сопутствующих аксессуаров. Также можно
        направить людей в вашу программу лояльности.
      </P>

      <InlineCta
        title="Создайте QR-код для своей страницы"
        desc="BeyLink автоматически создаёт QR высокого разрешения для каждого профиля. Бесплатного плана достаточно."
        href="/register"
        label="Создать →"
      />

      <H3>6. Слайды презентации</H3>
      <P>
        На последнем слайде поставьте QR-код вместо «Подпишитесь на меня». Аудитория мгновенно попадает в ваши соцсети.
        Если сессия многолюдная, даже те, кто не может добраться до микрофона, найдут вас.
      </P>

      <H3>7. Подписи в почте</H3>
      <P>
        Небольшой QR в корпоративной подписи к письму, профессиональный вид плюс лёгкий доступ. Получатель мгновенно
        находит вас в соцсетях.
      </P>

      <H3>8. Рекламные постеры (уличные)</H3>
      <P>
        Остановки, станции метро, постеры в торговых центрах. Крупные QR-коды читаются даже на расстоянии. Мгновенный
        переход на страницу вашей кампании.
      </P>

      <H2>5 правил успеха QR</H2>
      <OL>
        <li><strong>Убедитесь, что страница назначения оптимизирована под мобильные</strong> (98% открывают её на телефоне)</li>
        <li><strong>Держите страницу быстро загружающейся</strong>: правило 3 секунд</li>
        <li><strong>Показывайте QR в контексте</strong>, с чётким призывом вроде «Сканируйте для меню»</li>
        <li><strong>Сделайте его достаточно большим</strong> (минимум 2x2 см, больше, если его нужно видеть издалека)</li>
        <li><strong>Протестируйте его</strong>: после печати всегда сканируйте несколькими разными телефонами</li>
      </OL>

      <Callout tone="warn" title="Контраст важен">
        Тёмная часть QR должна располагаться на белом фоне. Цветные QR-коды в тренде, но{' '}
        <strong>чем ниже контраст, тем чаще сбои сканирования</strong>. Будьте осторожны с художественными QR-кодами.
      </Callout>

      <H2>Заключение</H2>
      <P>
        QR-код это мост между офлайн и онлайн. Но за этим мостом должна быть добротная{' '}
        <A href="/">страница ссылки в био</A>. BeyLink автоматически создаёт бесплатный QR для каждой страницы; вы лишь
        выбираете, где его использовать.
      </P>
      <P>
        <A href="/register">Создайте бесплатную страницу</A>, скачайте свой QR и сделайте первый заказ визиток.
      </P>
    </>
  );
}

function PostEs() {
  return (
    <>
      <P>
        El código QR vivió una segunda primavera durante la pandemia, y ahora forma parte del día a día: de los menús a
        los escaparates, de las tarjetas de visita a los carteles, está en todas partes. Pero ¿estás usando los códigos
        QR de forma realmente <strong>efectiva</strong>? En esta guía cubrimos 8 escenarios prácticos y una estrategia de
        códigos QR.
      </P>

      <H2>¿Por qué un código QR?</H2>
      <P>
        Es la tecnología más simple para unir el mundo offline y el online. Cuando alguien escanea con el teléfono el
        código QR de un cartel, <strong>llega a tu página al instante</strong>. Sin teclear direcciones, sin buscar.
        Interacción en dos segundos.
      </P>

      <Callout tone="info" title="Lo que un QR no es">
        Un código QR no es una herramienta mágica de conversión. Es solo un atajo que <strong>acelera el clic</strong>.
        La verdadera magia ocurre en la <A href="/">página link in bio</A> a la que apunta el QR.
      </Callout>

      <H2>8 escenarios prácticos de QR</H2>

      <H3>1. El reverso de una tarjeta de visita</H3>
      <P>
        Imprime un código QR en el reverso de tu tarjeta de visita clásica. Incluso después de que un visitante tire la
        tarjeta, aún puede encontrarte escaneando el QR. Los códigos QR de BeyLink se generan a una resolución que se
        mantiene nítida en impresión A4.
      </P>

      <H3>2. Menús de restaurante</H3>
      <P>
        Cambia la carta de mesa por un menú digital mediante QR. Las ventajas:
      </P>
      <UL>
        <li>Actualizar el menú es gratis (sin costes de impresión)</li>
        <li>Puedes añadir imágenes (fotos de los platos)</li>
        <li>La información de alérgenos es fácil de mantener al día</li>
        <li>Puede enlazar a una página de pedidos online</li>
      </UL>

      <H3>3. Acreditaciones de eventos/congresos</H3>
      <P>
        Un QR personal de LinkedIn/BeyLink en la acreditación de un asistente, la forma más rápida de hacer networking.
        Dos personas se conocen, escanean el QR del otro y se siguen en redes sociales en segundos.
      </P>

      <H3>4. Escaparates y carteles</H3>
      <P>
        Aunque la tienda esté cerrada, un código QR en el escaparate envía a los visitantes a tu web de comercio
        electrónico o a tus redes sociales. Potencial de ventas incluso de noche.
      </P>

      <H3>5. Embalaje del producto</H3>
      <P>
        Un QR en el embalaje del producto: manual de uso, registro de garantía, sugerencias de accesorios relacionados.
        También puedes dirigir a la gente a tu programa de fidelización de clientes.
      </P>

      <InlineCta
        title="Crea un código QR para tu página"
        desc="BeyLink genera automáticamente un QR de alta resolución para cada perfil. El plan gratuito es suficiente."
        href="/register"
        label="Crear ahora →"
      />

      <H3>6. Diapositivas de presentación</H3>
      <P>
        En tu diapositiva final, pon un código QR en lugar de "Sígueme". El público llega a tus redes sociales al
        instante. Si la sesión está abarrotada, incluso quienes no pueden acercarse al micrófono te encontrarán.
      </P>

      <H3>7. Firmas de correo</H3>
      <P>
        Un QR pequeño en tu firma de correo corporativa, un aspecto profesional más un acceso fácil. El destinatario te
        encuentra en redes sociales en un abrir y cerrar de ojos.
      </P>

      <H3>8. Carteles de campaña (exterior)</H3>
      <P>
        Paradas de autobús, estaciones de metro, carteles de centros comerciales. Los códigos QR grandes se leen incluso
        a distancia. Envío instantáneo a la página de tu campaña.
      </P>

      <H2>5 reglas para el éxito del QR</H2>
      <OL>
        <li><strong>Asegúrate de que la página de destino esté optimizada para móvil</strong> (el 98% lo abre en el teléfono)</li>
        <li><strong>Haz que la página cargue rápido</strong>: la regla de los 3 segundos</li>
        <li><strong>Muestra el QR en contexto</strong>, con una llamada clara como "Escanea para ver el menú"</li>
        <li><strong>Hazlo lo bastante grande</strong> (mínimo 2x2 cm, más si hay que verlo desde lejos)</li>
        <li><strong>Pruébalo</strong>: tras imprimir, escanéalo siempre con varios teléfonos distintos</li>
      </OL>

      <Callout tone="warn" title="El contraste importa">
        La parte oscura del QR debería ir sobre un fondo blanco. Los códigos QR de colores están de moda, pero{' '}
        <strong>a menor contraste, más fallos de escaneo</strong>. Ten cuidado con los códigos QR artísticos.
      </Callout>

      <H2>Conclusión</H2>
      <P>
        Un código QR es el puente entre el offline y el online. Pero al otro lado de ese puente tiene que haber una buena{' '}
        <A href="/">página link in bio</A>. BeyLink genera un QR gratis automáticamente para cada página; tú solo eliges
        dónde usarlo.
      </P>
      <P>
        <A href="/register">Crea tu página gratuita</A>, descarga tu QR y haz tu primer pedido de tarjetas de visita.
      </P>
    </>
  );
}

function PostDe() {
  return (
    <>
      <P>
        Der QR-Code erlebte während der Pandemie einen zweiten Frühling und gehört heute zum Alltag: von Speisekarten bis
        Schaufenstern, von Visitenkarten bis Postern, er ist überall. Aber setzt du QR-Codes wirklich{' '}
        <strong>effektiv</strong> ein? In diesem Guide zeigen wir 8 praktische Szenarien und eine QR-Code-Strategie.
      </P>

      <H2>Warum ein QR-Code?</H2>
      <P>
        Es ist die einfachste Technologie, um Offline- und Online-Welt zu verbinden. Wenn jemand den QR-Code auf einem
        Poster mit dem Handy scannt, <strong>landet er sofort auf deiner Seite</strong>. Kein Adressentippen, kein Suchen.
        Interaktion in zwei Sekunden.
      </P>

      <Callout tone="info" title="Was ein QR nicht ist">
        Ein QR-Code ist kein magisches Conversion-Tool. Er ist nur eine Abkürzung, die <strong>den Klick
        beschleunigt</strong>. Die echte Magie passiert auf der <A href="/">Link-in-Bio-Seite</A>, auf die der QR zeigt.
      </Callout>

      <H2>8 praktische QR-Szenarien</H2>

      <H3>1. Die Rückseite einer Visitenkarte</H3>
      <P>
        Drucke einen QR-Code auf die Rückseite deiner klassischen Visitenkarte. Selbst nachdem ein Besucher die Karte
        weggeworfen hat, kann er dich durch das Scannen des QR noch finden. BeyLink-QR-Codes werden in einer Auflösung
        erzeugt, die im A4-Druck gestochen scharf bleibt.
      </P>

      <H3>2. Restaurant-Speisekarten</H3>
      <P>
        Tausche die Tisch-Speisekarte gegen eine digitale Speisekarte per QR. Die Vorteile:
      </P>
      <UL>
        <li>Menü-Updates sind kostenlos (keine Druckkosten)</li>
        <li>Du kannst Bilder hinzufügen (Food-Fotos)</li>
        <li>Allergen-Infos lassen sich leicht aktuell halten</li>
        <li>Es kann auf eine Online-Bestellseite verlinken</li>
      </UL>

      <H3>3. Event-/Konferenz-Badges</H3>
      <P>
        Ein persönlicher LinkedIn/BeyLink-QR auf einem Teilnehmer-Badge, der schnellste Weg zum Netzwerken. Zwei Menschen
        treffen sich, scannen den QR des anderen und folgen sich in Sekunden in Social Media.
      </P>

      <H3>4. Schaufenster und Poster</H3>
      <P>
        Selbst wenn der Laden geschlossen ist, schickt ein QR-Code im Fenster Besucher auf deine E-Commerce-Seite oder
        Social Media. Verkaufspotenzial sogar nachts.
      </P>

      <H3>5. Produktverpackung</H3>
      <P>
        Ein QR auf der Produktverpackung: Bedienungsanleitung, Garantie-Registrierung, Vorschläge für passendes Zubehör.
        Du kannst Leute auch zu deinem Kundentreueprogramm leiten.
      </P>

      <InlineCta
        title="Erstelle einen QR-Code für deine Seite"
        desc="BeyLink erzeugt für jedes Profil automatisch einen hochauflösenden QR. Der kostenlose Tarif reicht aus."
        href="/register"
        label="Jetzt erstellen →"
      />

      <H3>6. Präsentationsfolien</H3>
      <P>
        Setze auf deine letzte Folie einen QR-Code statt „Folge mir“. Das Publikum erreicht deine Social Media sofort.
        Ist die Session voll, finden dich selbst diejenigen, die nicht ans Mikrofon kommen.
      </P>

      <H3>7. E-Mail-Signaturen</H3>
      <P>
        Ein kleiner QR in deiner geschäftlichen E-Mail-Signatur, ein professioneller Look plus einfacher Zugang. Der
        Empfänger findet dich blitzschnell in Social Media.
      </P>

      <H3>8. Kampagnenposter (Außenbereich)</H3>
      <P>
        Bushaltestellen, U-Bahn-Stationen, Poster in Einkaufszentren. Große QR-Codes sind sogar aus der Ferne lesbar.
        Sofortige Weiterleitung zu deiner Kampagnenseite.
      </P>

      <H2>5 Regeln für QR-Erfolg</H2>
      <OL>
        <li><strong>Stelle sicher, dass die Zielseite mobiloptimiert ist</strong> (98 % öffnen sie am Handy)</li>
        <li><strong>Halte die Seite schnell ladend</strong>: die 3-Sekunden-Regel</li>
        <li><strong>Zeige den QR im Kontext</strong>, mit einem klaren Aufruf wie „Für die Speisekarte scannen“</li>
        <li><strong>Mache ihn groß genug</strong> (mindestens 2x2 cm, größer, wenn er aus der Ferne sichtbar sein soll)</li>
        <li><strong>Teste ihn</strong>: Scanne ihn nach dem Druck immer mit ein paar verschiedenen Handys</li>
      </OL>

      <Callout tone="warn" title="Kontrast zählt">
        Der dunkle Teil des QR sollte auf weißem Hintergrund sitzen. Bunte QR-Codes sind angesagt, aber{' '}
        <strong>je geringer der Kontrast, desto mehr Scan-Fehler</strong>. Sei vorsichtig mit künstlerischen QR-Codes.
      </Callout>

      <H2>Fazit</H2>
      <P>
        Ein QR-Code ist die Brücke zwischen Offline und Online. Aber jenseits dieser Brücke muss es eine solide{' '}
        <A href="/">Link-in-Bio-Seite</A> geben. BeyLink erzeugt für jede Seite automatisch einen kostenlosen QR; du
        wählst nur, wo du ihn einsetzt.
      </P>
      <P>
        <A href="/register">Erstelle deine kostenlose Seite</A>, lade deinen QR herunter und gib deine erste
        Visitenkarten-Bestellung auf.
      </P>
    </>
  );
}

function PostFr() {
  return (
    <>
      <P>
        Le QR code a connu un second printemps pendant la pandémie, et il fait désormais partie du quotidien : des menus
        aux vitrines, des cartes de visite aux affiches, il est partout. Mais utilisez-vous vraiment les QR codes de
        façon <strong>efficace</strong> ? Dans ce guide, nous couvrons 8 scénarios pratiques et une stratégie de QR code.
      </P>

      <H2>Pourquoi un QR code ?</H2>
      <P>
        C'est la technologie la plus simple pour relier les mondes hors ligne et en ligne. Quand quelqu'un scanne le QR
        code d'une affiche avec son téléphone, il <strong>arrive sur votre page instantanément</strong>. Pas d'adresse à
        taper, pas de recherche. Interaction en deux secondes.
      </P>

      <Callout tone="info" title="Ce qu'un QR n'est pas">
        Un QR code n'est pas un outil de conversion magique. Ce n'est qu'un raccourci qui <strong>accélère le
        clic</strong>. La vraie magie se produit sur la <A href="/">page de lien en bio</A> vers laquelle pointe le QR.
      </Callout>

      <H2>8 scénarios pratiques de QR</H2>

      <H3>1. Le dos d'une carte de visite</H3>
      <P>
        Imprimez un QR code au dos de votre carte de visite classique. Même après qu'un visiteur a jeté la carte, il peut
        encore vous retrouver en scannant le QR. Les QR codes de BeyLink sont générés dans une résolution qui reste nette
        en impression A4.
      </P>

      <H3>2. Les menus de restaurant</H3>
      <P>
        Remplacez le menu de table par un menu numérique via un QR. Les avantages :
      </P>
      <UL>
        <li>Mettre à jour le menu est gratuit (pas de frais d'impression)</li>
        <li>Vous pouvez ajouter des images (photos des plats)</li>
        <li>Les informations sur les allergènes sont faciles à garder à jour</li>
        <li>Il peut renvoyer vers une page de commande en ligne</li>
      </UL>

      <H3>3. Les badges d'événements/conférences</H3>
      <P>
        Un QR personnel LinkedIn/BeyLink sur un badge de participant, le moyen le plus rapide de réseauter. Deux
        personnes se rencontrent, scannent le QR de l'autre et s'abonnent mutuellement sur les réseaux sociaux en
        quelques secondes.
      </P>

      <H3>4. Vitrines et affiches</H3>
      <P>
        Même quand la boutique est fermée, un QR code en vitrine envoie les visiteurs vers votre site e-commerce ou vos
        réseaux sociaux. Un potentiel de ventes même la nuit.
      </P>

      <H3>5. L'emballage produit</H3>
      <P>
        Un QR sur l'emballage du produit : mode d'emploi, enregistrement de la garantie, suggestions d'accessoires
        associés. Vous pouvez aussi diriger les gens vers votre programme de fidélité client.
      </P>

      <InlineCta
        title="Créez un QR code pour votre page"
        desc="BeyLink génère automatiquement un QR haute résolution pour chaque profil. Le forfait gratuit suffit."
        href="/register"
        label="Créer maintenant →"
      />

      <H3>6. Les diapositives de présentation</H3>
      <P>
        Sur votre dernière diapositive, mettez un QR code au lieu de « Suivez-moi ». Le public atteint vos réseaux
        sociaux instantanément. Si la session est bondée, même ceux qui ne peuvent pas atteindre le micro vous trouvent.
      </P>

      <H3>7. Les signatures d'e-mail</H3>
      <P>
        Un petit QR dans votre signature d'e-mail professionnelle : un rendu soigné plus un accès facile. Le destinataire
        vous retrouve sur les réseaux sociaux en un clin d'œil.
      </P>

      <H3>8. Les affiches de campagne (extérieur)</H3>
      <P>
        Arrêts de bus, stations de métro, affiches en centre commercial. Les grands QR codes se lisent même à distance.
        Redirection instantanée vers la page de votre campagne.
      </P>

      <H2>5 règles pour réussir avec un QR</H2>
      <OL>
        <li><strong>Assurez-vous que la page de destination est optimisée pour le mobile</strong> (98 % l'ouvrent sur un téléphone)</li>
        <li><strong>Gardez la page rapide à charger</strong> : la règle des 3 secondes</li>
        <li><strong>Montrez le QR en contexte</strong>, avec un appel clair comme « Scannez pour le menu »</li>
        <li><strong>Faites-le assez grand</strong> (minimum 2x2 cm, plus grand s'il doit être vu de loin)</li>
        <li><strong>Testez-le</strong> : après impression, scannez-le toujours avec plusieurs téléphones différents</li>
      </OL>

      <Callout tone="warn" title="Le contraste compte">
        La partie sombre du QR doit se trouver sur un fond blanc. Les QR codes colorés sont à la mode, mais{' '}
        <strong>plus le contraste baisse, plus les échecs de scan augmentent</strong>. Méfiez-vous des QR codes
        artistiques.
      </Callout>

      <H2>Conclusion</H2>
      <P>
        Un QR code est le pont entre le hors ligne et le en ligne. Mais au-delà de ce pont, il faut une bonne{' '}
        <A href="/">page de lien en bio</A>. BeyLink génère automatiquement un QR gratuit pour chaque page ; vous n'avez
        qu'à choisir où l'utiliser.
      </P>
      <P>
        <A href="/register">Créez votre page gratuite</A>, téléchargez votre QR et passez votre première commande de
        cartes de visite.
      </P>
    </>
  );
}

function PostPt() {
  return (
    <>
      <P>
        O código QR viveu uma segunda primavera durante a pandemia e agora faz parte do dia a dia: dos cardápios às
        vitrines, dos cartões de visita aos cartazes, ele está em todo lugar. Mas será que você está usando os códigos QR
        de forma realmente <strong>eficaz</strong>? Neste guia cobrimos 8 cenários práticos e uma estratégia de código QR.
      </P>

      <H2>Por que um código QR?</H2>
      <P>
        É a tecnologia mais simples para unir os mundos offline e online. Quando alguém escaneia com o celular o código QR
        de um cartaz, <strong>chega à sua página na hora</strong>. Sem digitar endereços, sem pesquisar. Interação em dois
        segundos.
      </P>

      <Callout tone="info" title="O que um QR não é">
        Um código QR não é uma ferramenta mágica de conversão. É apenas um atalho que <strong>acelera o clique</strong>. A
        verdadeira mágica acontece na <A href="/">página de link na bio</A> para a qual o QR aponta.
      </Callout>

      <H2>8 cenários práticos de QR</H2>

      <H3>1. O verso de um cartão de visita</H3>
      <P>
        Imprima um código QR no verso do seu cartão de visita clássico. Mesmo depois que um visitante joga o cartão fora,
        ele ainda pode te encontrar escaneando o QR. Os códigos QR do BeyLink são gerados em uma resolução que continua
        nítida na impressão A4.
      </P>

      <H3>2. Cardápios de restaurante</H3>
      <P>
        Troque o cardápio de mesa por um cardápio digital via QR. As vantagens:
      </P>
      <UL>
        <li>Atualizar o cardápio é grátis (sem custos de impressão)</li>
        <li>Você pode adicionar imagens (fotos dos pratos)</li>
        <li>As informações de alérgenos são fáceis de manter atualizadas</li>
        <li>Pode linkar para uma página de pedidos online</li>
      </UL>

      <H3>3. Crachás de eventos/conferências</H3>
      <P>
        Um QR pessoal de LinkedIn/BeyLink no crachá de um participante, a forma mais rápida de fazer networking. Duas
        pessoas se conhecem, escaneiam o QR uma da outra e se seguem nas redes sociais em segundos.
      </P>

      <H3>4. Vitrines e cartazes</H3>
      <P>
        Mesmo com a loja fechada, um código QR na vitrine envia os visitantes para o seu site de e-commerce ou para as
        suas redes sociais. Potencial de vendas até de madrugada.
      </P>

      <H3>5. Embalagem do produto</H3>
      <P>
        Um QR na embalagem do produto: manual de uso, registro de garantia, sugestões de acessórios relacionados. Você
        também pode direcionar as pessoas para o seu programa de fidelidade.
      </P>

      <InlineCta
        title="Crie um código QR para a sua página"
        desc="O BeyLink gera automaticamente um QR de alta resolução para cada perfil. O plano gratuito basta."
        href="/register"
        label="Criar agora →"
      />

      <H3>6. Slides de apresentação</H3>
      <P>
        No seu slide final, coloque um código QR em vez de "Me siga". A plateia chega às suas redes sociais na hora. Se a
        sessão estiver cheia, até quem não consegue chegar ao microfone encontra você.
      </P>

      <H3>7. Assinaturas de e-mail</H3>
      <P>
        Um QR pequeno na sua assinatura de e-mail corporativa, um visual profissional mais acesso fácil. O destinatário
        te encontra nas redes sociais num piscar de olhos.
      </P>

      <H3>8. Cartazes de campanha (externos)</H3>
      <P>
        Pontos de ônibus, estações de metrô, cartazes em shoppings. Códigos QR grandes são legíveis até à distância.
        Encaminhamento instantâneo para a página da sua campanha.
      </P>

      <H2>5 regras para o sucesso do QR</H2>
      <OL>
        <li><strong>Garanta que a página de destino seja otimizada para celular</strong> (98% abrem no telefone)</li>
        <li><strong>Mantenha a página com carregamento rápido</strong>: a regra dos 3 segundos</li>
        <li><strong>Mostre o QR em contexto</strong>, com uma chamada clara como "Escaneie para ver o cardápio"</li>
        <li><strong>Faça-o grande o suficiente</strong> (mínimo 2x2 cm, maior se precisar ser visto de longe)</li>
        <li><strong>Teste-o</strong>: depois de imprimir, escaneie sempre com alguns celulares diferentes</li>
      </OL>

      <Callout tone="warn" title="O contraste importa">
        A parte escura do QR deve ficar sobre um fundo branco. Códigos QR coloridos estão na moda, mas{' '}
        <strong>quanto menor o contraste, mais falhas de leitura</strong>. Cuidado com os códigos QR artísticos.
      </Callout>

      <H2>Conclusão</H2>
      <P>
        Um código QR é a ponte entre o offline e o online. Mas do outro lado dessa ponte precisa haver uma boa{' '}
        <A href="/">página de link na bio</A>. O BeyLink gera um QR gratuito automaticamente para cada página; você só
        escolhe onde usá-lo.
      </P>
      <P>
        <A href="/register">Crie a sua página gratuita</A>, baixe o seu QR e faça o seu primeiro pedido de cartões de visita.
      </P>
    </>
  );
}

function PostIt() {
  return (
    <>
      <P>
        Il codice QR ha vissuto una seconda primavera durante la pandemia, e ora fa parte della vita di tutti i giorni:
        dai menu alle vetrine, dai biglietti da visita ai poster, è ovunque. Ma stai davvero usando i codici QR in modo
        <strong> efficace</strong>? In questa guida vediamo 8 scenari pratici e una strategia per i codici QR.
      </P>

      <H2>Perché un codice QR?</H2>
      <P>
        È la tecnologia più semplice per collegare il mondo offline e quello online. Quando qualcuno scansiona con il
        telefono il codice QR su un poster, <strong>raggiunge la tua pagina all'istante</strong>. Niente indirizzi da
        digitare, niente ricerche. Interazione in due secondi.
      </P>

      <Callout tone="info" title="Cosa non è un QR">
        Un codice QR non è uno strumento di conversione magico. È solo una scorciatoia che <strong>velocizza il
        clic</strong>. La vera magia avviene sulla <A href="/">pagina link in bio</A> a cui il QR punta.
      </Callout>

      <H2>8 scenari pratici per i QR</H2>

      <H3>1. Il retro di un biglietto da visita</H3>
      <P>
        Stampa un codice QR sul retro del tuo biglietto da visita classico. Anche dopo che un visitatore ha buttato il
        biglietto, può comunque trovarti scansionando il QR. I codici QR di BeyLink sono generati a una risoluzione che
        resta nitida nella stampa A4.
      </P>

      <H3>2. Menu dei ristoranti</H3>
      <P>
        Sostituisci il menu da tavolo con un menu digitale tramite QR. I vantaggi:
      </P>
      <UL>
        <li>Gli aggiornamenti del menu sono gratuiti (nessun costo di stampa)</li>
        <li>Puoi aggiungere immagini (foto dei piatti)</li>
        <li>Le informazioni sugli allergeni sono facili da tenere aggiornate</li>
        <li>Può collegarsi a una pagina di ordini online</li>
      </UL>

      <H3>3. Badge per eventi/conferenze</H3>
      <P>
        Un QR personale LinkedIn/BeyLink su un badge da partecipante: il modo più veloce per fare networking. Due persone
        si incontrano, scansionano il QR l'una dell'altra e si seguono sui social in pochi secondi.
      </P>

      <H3>4. Vetrine e poster</H3>
      <P>
        Anche quando il negozio è chiuso, un codice QR in vetrina porta i visitatori al tuo sito e-commerce o ai tuoi
        social. Potenziale di vendita anche di notte.
      </P>

      <H3>5. Confezioni dei prodotti</H3>
      <P>
        Un QR sulla confezione del prodotto: manuale d'uso, registrazione della garanzia, suggerimenti di accessori
        correlati. Puoi anche indirizzare le persone al tuo programma fedeltà.
      </P>

      <InlineCta
        title="Crea un codice QR per la tua pagina"
        desc="BeyLink genera in automatico un QR ad alta risoluzione per ogni profilo. Il piano gratuito basta."
        href="/register"
        label="Crea ora →"
      />

      <H3>6. Slide di presentazione</H3>
      <P>
        Nell'ultima slide, metti un codice QR al posto di "Seguimi". Il pubblico raggiunge i tuoi social all'istante. Se
        la sessione è affollata, anche chi non riesce ad arrivare al microfono può trovarti.
      </P>

      <H3>7. Firme e-mail</H3>
      <P>
        Un piccolo QR nella tua firma e-mail aziendale: look professionale più accesso facile. Il destinatario ti trova
        sui social in un lampo.
      </P>

      <H3>8. Poster delle campagne (esterno)</H3>
      <P>
        Fermate dell'autobus, stazioni della metro, poster nei centri commerciali. I codici QR grandi sono leggibili
        anche da lontano. Instradamento immediato alla tua pagina di campagna.
      </P>

      <H2>5 regole per il successo dei QR</H2>
      <OL>
        <li><strong>Assicurati che la pagina di destinazione sia ottimizzata per mobile</strong> (il 98% lo apre da telefono)</li>
        <li><strong>Mantieni la pagina veloce nel caricamento</strong>: la regola dei 3 secondi</li>
        <li><strong>Mostra il QR nel contesto</strong>, con un invito chiaro come "Scansiona per il menu"</li>
        <li><strong>Rendilo abbastanza grande</strong> (minimo 2x2 cm, più grande se deve essere visto da lontano)</li>
        <li><strong>Testalo</strong>: dopo la stampa, scansiona sempre con qualche telefono diverso</li>
      </OL>

      <Callout tone="warn" title="Il contrasto conta">
        La parte scura del QR dovrebbe stare su uno sfondo bianco. I codici QR colorati sono di tendenza, ma{' '}
        <strong>man mano che il contrasto cala, aumentano le scansioni fallite</strong>. Attenzione ai codici QR artistici.
      </Callout>

      <H2>Conclusione</H2>
      <P>
        Un codice QR è il ponte tra offline e online. Ma oltre quel ponte deve esserci una solida{' '}
        <A href="/">pagina link in bio</A>. BeyLink genera in automatico un QR gratuito per ogni pagina; a te basta
        scegliere dove usarlo.
      </P>
      <P>
        <A href="/register">Crea la tua pagina gratuita</A>, scarica il tuo QR e fai il tuo primo ordine di biglietti da visita.
      </P>
    </>
  );
}

function PostJa() {
  return (
    <>
      <P>
        QRコードはパンデミックのあいだに再びの春を迎え、いまや日常の一部です。メニューから店頭、名刺からポスターまで、どこにでもあります。
        でも、あなたは本当にQRコードを<strong>効果的に</strong>使えているでしょうか。このガイドでは、8つの実践的なシナリオと、QRコードの戦略を解説します。
      </P>

      <H2>なぜQRコードなのか？</H2>
      <P>
        オフラインとオンラインの世界をつなぐ、いちばんシンプルな技術です。誰かがポスターのQRコードをスマホでスキャンすると、
        <strong>その場であなたのページに到達します</strong>。アドレスを打つことも、検索することもいりません。2秒でエンゲージメントです。
      </P>

      <Callout tone="info" title="QRではないもの">
        QRコードは、魔法のコンバージョンツールではありません。<strong>クリックを速くする</strong>だけのショートカットです。
        本当の魔法は、QRが指し示す<A href="/">プロフィールリンクのページ</A>で起こります。
      </Callout>

      <H2>8つの実践的なQRシナリオ</H2>

      <H3>1. 名刺の裏</H3>
      <P>
        紙の名刺の裏にQRコードを印刷しましょう。訪問者が名刺を捨てたあとでも、QRをスキャンすればあなたを見つけられます。
        BeyLinkのQRコードは、A4印刷でも鮮明さを保つ解像度で生成されます。
      </P>

      <H3>2. レストランのメニュー</H3>
      <P>
        テーブルのメニュー表を、QR経由のデジタルメニューに置き換えましょう。利点はこちらです。
      </P>
      <UL>
        <li>メニューの更新が無料（印刷コストなし）</li>
        <li>画像を追加できる（料理の写真）</li>
        <li>アレルギー情報を最新に保ちやすい</li>
        <li>オンライン注文ページにリンクできる</li>
      </UL>

      <H3>3. イベント/カンファレンスの名札</H3>
      <P>
        参加者の名札に、個人のLinkedIn/BeyLinkのQRを。これが最速のネットワーキングです。2人が出会い、互いのQRをスキャンし、
        数秒でSNSをフォローし合えます。
      </P>

      <H3>4. 店頭とポスター</H3>
      <P>
        店が閉まっているときでも、ショーウィンドウのQRコードが訪問者をECサイトやSNSへ送ります。夜でも売上のチャンスがあります。
      </P>

      <H3>5. 商品パッケージ</H3>
      <P>
        商品パッケージのQR。取扱説明書、保証登録、関連アクセサリーの提案。顧客のロイヤルティプログラムへ誘導することもできます。
      </P>

      <InlineCta
        title="あなたのページのQRコードを作る"
        desc="BeyLinkはプロフィールごとに高解像度のQRを自動生成します。無料プランで十分です。"
        href="/register"
        label="今すぐ作る →"
      />

      <H3>6. プレゼンのスライド</H3>
      <P>
        最後のスライドに、「フォローしてね」の代わりにQRコードを置きましょう。聴衆はその場であなたのSNSに到達します。
        会場が混んでいて、マイクにたどり着けない人でも、あなたを見つけられます。
      </P>

      <H3>7. メールの署名</H3>
      <P>
        会社のメール署名に小さなQRを。プロらしい見た目に加えて、アクセスも簡単です。受け取った人は、あっという間にあなたをSNSで見つけます。
      </P>

      <H3>8. キャンペーンポスター（屋外）</H3>
      <P>
        バス停、駅、商業施設のポスター。大きなQRコードは、離れていても読み取れます。キャンペーンページへ、その場で誘導できます。
      </P>

      <H2>QR成功の5つのルール</H2>
      <OL>
        <li><strong>リンク先のページがモバイル最適化されているか確認する</strong>（98%はスマホで開きます）</li>
        <li><strong>ページを高速に保つ</strong>：3秒ルール</li>
        <li><strong>QRは文脈の中で見せる</strong>。「メニューはこちらをスキャン」のような明確な呼びかけとともに</li>
        <li><strong>十分に大きくする</strong>（最低2×2cm、遠くから見せるならもっと大きく）</li>
        <li><strong>テストする</strong>：印刷後は必ず、いくつかの異なるスマホでスキャンしてみる</li>
      </OL>

      <Callout tone="warn" title="コントラストが大事">
        QRの濃い部分は、白い背景の上に置きましょう。カラフルなQRコードは流行っていますが、<strong>コントラストが下がるほど、読み取り失敗が増えます</strong>。
        アート風のQRコードには注意してください。
      </Callout>

      <H2>まとめ</H2>
      <P>
        QRコードは、オフラインとオンラインをつなぐ橋です。でも、その橋の向こうには、しっかりした{' '}
        <A href="/">プロフィールリンクのページ</A>が必要です。BeyLinkはページごとに無料のQRを自動生成します。あなたは、どこで使うかを選ぶだけです。
      </P>
      <P>
        <A href="/register">無料でページを作り</A>、QRをダウンロードして、最初の名刺を発注しましょう。
      </P>
    </>
  );
}

export default function Post() {
  const { lang } = useLanguage();
  return lang === 'ja' ? <PostJa /> : lang === 'it' ? <PostIt /> : lang === 'pt' ? <PostPt /> : lang === 'fr' ? <PostFr /> : lang === 'de' ? <PostDe /> : lang === 'ru' ? <PostRu /> : lang === 'es' ? <PostEs /> : lang === 'en' ? <PostEn /> : <PostTr />;
}
