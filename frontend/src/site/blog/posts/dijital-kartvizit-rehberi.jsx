import { H2, H3, P, UL, OL, A, Callout, InlineCta } from '../PostBody.jsx';
import { useLanguage } from '../../../context/LanguageContext.jsx';

export const meta = {
  slug: 'digital-business-card-guide',
  title: {
    tr: 'Dijital Kartvizit Rehberi: 2026 için Modern Yaklaşım',
    en: 'Digital Business Card Guide: A Modern 2026 Approach',
    ru: 'Гид по цифровой визитке: современный подход 2026',
    es: 'Guía de tarjeta de visita digital: enfoque 2026',
    de: 'Digitale Visitenkarte: Der moderne Guide für 2026',
    fr: 'Carte de visite numérique : le guide moderne 2026',
    pt: 'Guia do cartão de visita digital: abordagem 2026',
    it: 'Biglietto da visita digitale: la guida al 2026',
    ja: 'デジタル名刺ガイド：2026年のモダンな作り方',
  },
  description: {
    tr: 'Klasik kartvizit yerine dijital: nasıl oluşturulur, hangi bilgiler yer almalı ve profesyonel görünüm için 6 ipucu.',
    en: 'Digital instead of a classic business card: how to create one, what to include, and 6 tips for a professional look.',
    ru: 'Цифровая визитка вместо классической: как её создать, что включить и 6 советов для профессионального вида.',
    es: 'Digital en lugar de una tarjeta de visita clásica: cómo crearla, qué incluir y 6 consejos para un aspecto profesional.',
    de: 'Digital statt klassischer Visitenkarte: wie du eine erstellst, was hineingehört und 6 Tipps für einen professionellen Look.',
    fr: 'Numérique plutôt qu\'une carte de visite classique : comment la créer, quoi y mettre et 6 astuces pour un rendu professionnel.',
    pt: 'Digital em vez do cartão de visita clássico: como criar, o que incluir e 6 dicas para um visual profissional.',
    it: 'Digitale al posto del classico biglietto da visita: come crearlo, cosa includere e 6 consigli per un look professionale.',
    ja: '紙の名刺の代わりにデジタルへ。作り方、載せるべき情報、プロらしく見せる6つのコツを解説します。',
  },
  category: 'araclar',
  tags: {
    tr: ['kartvizit', 'dijital', 'vcard', 'iletişim'],
    en: ['business card', 'digital', 'vcard', 'contact'],
    ru: ['визитка', 'цифровая', 'vcard', 'контакты'],
    es: ['tarjeta de visita', 'digital', 'vcard', 'contacto'],
    de: ['visitenkarte', 'digital', 'vcard', 'kontakt'],
    fr: ['carte de visite', 'numérique', 'vcard', 'contact'],
    pt: ['cartão de visita', 'digital', 'vcard', 'contato'],
    it: ['biglietto da visita', 'digitale', 'vcard', 'contatto'],
    ja: ['名刺', 'デジタル', 'vcard', '連絡先'],
  },
  publishedAt: '2026-07-07',
  updatedAt: '2026-07-07',
  readingMinutes: 5,
  image: '/og-image.png',
  faq: {
    tr: [
      { q: 'Dijital kartvizit ile klasik kartvizit farkı nedir?', a: 'Dijital kartvizit güncellenebilir, ekstra bilgi barındırır (foto, video, sosyal medya) ve QR ile paylaşılır. Klasik kartvizit basılıdır, sabit ve tek yönlüdür.' },
      { q: 'vCard nedir?', a: 'vCard (.vcf uzantılı dosya) telefon rehberine eklenebilir standart bir kartvizit formatıdır. BeyLink her iletişim bloğunda otomatik vCard oluşturur.' },
      { q: 'Dijital kartvizit ücretsiz mi?', a: 'BeyLink\'te ücretsiz plan ile iletişim bloğu (dijital kartvizit) oluşturabilirsin. QR kodun da otomatik gelir.' },
    ],
    en: [
      { q: 'What\'s the difference between a digital and a classic business card?', a: 'A digital business card is updatable, holds extra information (photo, video, social media), and is shared via QR. A classic card is printed, static, and one-way.' },
      { q: 'What is a vCard?', a: 'A vCard (a .vcf file) is a standard business card format that can be added to a phone\'s contacts. BeyLink generates a vCard automatically for every contact block.' },
      { q: 'Is a digital business card free?', a: 'On BeyLink you can create a contact block (digital business card) with the free plan. Your QR code comes automatically too.' },
    ],
    ru: [
      { q: 'Чем цифровая визитка отличается от классической?', a: 'Цифровую визитку можно обновлять, она хранит дополнительную информацию (фото, видео, соцсети) и делится через QR. Классическая карточка печатная, статичная и односторонняя.' },
      { q: 'Что такое vCard?', a: 'vCard (файл .vcf) это стандартный формат визитки, который можно добавить в контакты телефона. BeyLink автоматически создаёт vCard для каждого блока контактов.' },
      { q: 'Цифровая визитка бесплатна?', a: 'В BeyLink можно создать блок контактов (цифровую визитку) на бесплатном плане. QR-код тоже появляется автоматически.' },
    ],
    es: [
      { q: '¿Qué diferencia hay entre una tarjeta de visita digital y una clásica?', a: 'Una tarjeta de visita digital es actualizable, contiene información extra (foto, vídeo, redes sociales) y se comparte por QR. Una tarjeta clásica es impresa, estática y unidireccional.' },
      { q: '¿Qué es una vCard?', a: 'Una vCard (un archivo .vcf) es un formato estándar de tarjeta de visita que se puede añadir a los contactos del teléfono. BeyLink genera una vCard automáticamente para cada bloque de contacto.' },
      { q: '¿La tarjeta de visita digital es gratis?', a: 'En BeyLink puedes crear un bloque de contacto (tarjeta de visita digital) con el plan gratuito. Tu código QR también llega automáticamente.' },
    ],
    de: [
      { q: 'Was ist der Unterschied zwischen einer digitalen und einer klassischen Visitenkarte?', a: 'Eine digitale Visitenkarte ist aktualisierbar, enthält Zusatzinfos (Foto, Video, Social Media) und wird per QR geteilt. Eine klassische Karte ist gedruckt, statisch und einseitig.' },
      { q: 'Was ist eine vCard?', a: 'Eine vCard (eine .vcf-Datei) ist ein Standard-Visitenkartenformat, das zu den Kontakten eines Handys hinzugefügt werden kann. BeyLink erzeugt für jeden Kontaktblock automatisch eine vCard.' },
      { q: 'Ist eine digitale Visitenkarte kostenlos?', a: 'Bei BeyLink kannst du mit dem Free-Tarif einen Kontaktblock (digitale Visitenkarte) erstellen. Dein QR-Code kommt ebenfalls automatisch dazu.' },
    ],
    fr: [
      { q: 'Quelle est la différence entre une carte de visite numérique et une carte classique ?', a: 'Une carte de visite numérique se met à jour, contient des informations supplémentaires (photo, vidéo, réseaux sociaux) et se partage via un QR. Une carte classique est imprimée, figée et à sens unique.' },
      { q: 'Qu\'est-ce qu\'une vCard ?', a: 'Une vCard (un fichier .vcf) est un format standard de carte de visite qui peut être ajouté aux contacts d\'un téléphone. BeyLink génère automatiquement une vCard pour chaque bloc de contact.' },
      { q: 'La carte de visite numérique est-elle gratuite ?', a: 'Sur BeyLink, vous pouvez créer un bloc de contact (carte de visite numérique) avec le forfait gratuit. Votre QR code arrive lui aussi automatiquement.' },
    ],
    pt: [
      { q: 'Qual a diferença entre um cartão de visita digital e um clássico?', a: 'Um cartão de visita digital é atualizável, guarda informações extras (foto, vídeo, redes sociais) e é compartilhado via QR. Um cartão clássico é impresso, estático e de mão única.' },
      { q: 'O que é uma vCard?', a: 'Uma vCard (um arquivo .vcf) é um formato padrão de cartão de visita que pode ser adicionado aos contatos do celular. O BeyLink gera uma vCard automaticamente para cada bloco de contato.' },
      { q: 'O cartão de visita digital é grátis?', a: 'No BeyLink você pode criar um bloco de contato (cartão de visita digital) com o plano gratuito. O seu código QR também vem automaticamente.' },
    ],
    it: [
      { q: 'Che differenza c\'è tra un biglietto da visita digitale e uno classico?', a: 'Un biglietto da visita digitale è aggiornabile, contiene informazioni extra (foto, video, social) e si condivide tramite QR. Un biglietto classico è stampato, statico e a senso unico.' },
      { q: 'Cos\'è una vCard?', a: 'Una vCard (un file .vcf) è un formato standard di biglietto da visita che può essere aggiunto ai contatti del telefono. BeyLink genera una vCard in automatico per ogni blocco di contatto.' },
      { q: 'Il biglietto da visita digitale è gratis?', a: 'Su BeyLink puoi creare un blocco di contatto (biglietto da visita digitale) con il piano gratuito. Anche il tuo codice QR arriva in automatico.' },
    ],
    ja: [
      { q: 'デジタル名刺と紙の名刺の違いは何ですか？', a: 'デジタル名刺は更新でき、追加情報（写真、動画、SNS）を持ち、QRで共有します。紙の名刺は印刷されていて、内容は固定で、一方通行です。' },
      { q: 'vCardとは何ですか？', a: 'vCard（.vcf形式のファイル）は、スマートフォンの連絡先に追加できる標準的な名刺フォーマットです。BeyLinkは連絡先ブロックごとに自動でvCardを生成します。' },
      { q: 'デジタル名刺は無料ですか？', a: 'BeyLinkでは無料プランで連絡先ブロック（デジタル名刺）を作れます。QRコードも自動でついてきます。' },
    ],
  },
};

function PostTr() {
  return (
    <>
      <P>
        Bir tanışıklıkta karşınıza dijital kartvizit çıkardığınızda ilk düşünce: <strong>"Bu adam işini takip etmiş."</strong>{' '}
        Klasik kartvizit hâlâ yerini koruyor ama dijital kartvizit çağın işareti. Bu rehberde nasıl profesyonel bir dijital
        kartvizit oluşturacağını anlattık.
      </P>

      <H2>Dijital kartvizit neden?</H2>
      <UL>
        <li><strong>Güncellenebilir:</strong> Yeni iş, yeni telefon — kartlar yeniden basılmaz.</li>
        <li><strong>Zengin içerik:</strong> Sadece isim ve telefon değil; sosyal medya, portföy, konum, video.</li>
        <li><strong>QR ile paylaşım:</strong> 2 saniyede karşı tarafa geçer.</li>
        <li><strong>Çevre dostu:</strong> Kağıt israfı yok.</li>
        <li><strong>Analitik:</strong> Kim ne zaman baktı, ne tıkladı — ölçülebilir.</li>
      </UL>

      <H2>İyi bir dijital kartvizitte neler olmalı?</H2>
      <OL>
        <li><strong>Profil fotoğrafı:</strong> Yüzün seninle bağ kurar. Yüksek çözünürlük.</li>
        <li><strong>İsim ve unvan:</strong> "Ayşe Yılmaz | Web Tasarımcı"</li>
        <li><strong>Kısa değer önerisi:</strong> "Küçük işletmelere modern web tasarımı"</li>
        <li><strong>vCard indirme:</strong> Karşı taraf tek tıkla rehberine eklesin</li>
        <li><strong>WhatsApp / e-posta / telefon:</strong> Doğrudan tıklanabilir</li>
        <li><strong>Sosyal medya linkleri:</strong> LinkedIn, Instagram, portföy</li>
        <li><strong>Kısa portföy örneği:</strong> 3-4 en iyi işin</li>
        <li><strong>Konum:</strong> Ofisin varsa harita bağlantısı</li>
      </OL>

      <InlineCta
        title="Dijital kartvizitini 5 dakikada oluştur"
        desc="BeyLink'in iletişim bloğu (vCard) ve QR kod özelliği ücretsiz plana dahil."
        href="/register"
        label="Ücretsiz Başla →"
      />

      <H2>Nasıl oluşturulur (adım adım)?</H2>
      <OL>
        <li><A href="/register">BeyLink hesabı aç</A>, kullanıcı adını seç</li>
        <li>Profil fotoğrafı ve kapak görsel ekle</li>
        <li>İsim ve tek cümlelik açıklama yaz</li>
        <li><strong>İletişim bloğu</strong> ekle: e-posta, telefon, adres — otomatik vCard oluşur</li>
        <li>Sosyal medya bloklarını ekle</li>
        <li>Portföy / mağaza gibi ek linklerini ekle</li>
        <li>Sayfanı yayınla, <strong>QR kodunu indir</strong> (ücretsiz)</li>
      </OL>

      <H2>Profesyonel görünüm için 6 ipucu</H2>

      <H3>1. Tutarlı marka rengi</H3>
      <P>
        Sosyal medyada kullandığın renklerin tam paletini burada da uygula. BeyLink temaları özelleştirilebilir.
      </P>

      <H3>2. Yüksek çözünürlüklü foto</H3>
      <P>
        Bulanık ya da düşük ışıklı foto profesyonellik kaybı. Doğal ışıkta çekilmiş, arkaplan sade bir portre en iyisi.
      </P>

      <H3>3. Bloklar arası önem sırası</H3>
      <P>
        En kritik iletişim yolu (WhatsApp mı, e-posta mı?) en üstte. Sosyal medya orta, portföy alt kısımda.
      </P>

      <H3>4. Görsel bütünlük</H3>
      <P>
        Sosyal medya ikonları aynı stilde, aynı boyutta — BeyLink otomatik yapıyor. Karmaşık düzen dijital kartvizite
        yakışmaz.
      </P>

      <H3>5. Hızlı erişim linki</H3>
      <P>
        "Randevu al", "Ücretsiz keşif görüşmesi", "Portföyümü indir" gibi tek net CTA öne çıkar. Ziyaretçin bir sonraki
        adımı net bilsin.
      </P>

      <H3>6. QR + link birlikte</H3>
      <P>
        Klasik kartvizit tamamen bırakma. Klasik kartın arka yüzüne QR kod bas — hem geleneksel hem modern.
        En iyisi ikisini birleştirmek.
      </P>

      <Callout tone="success" title="Bonus: NFC kartvizit">
        Bazı profesyoneller NFC (temaslı) kartvizit kullanıyor: telefonunuza yaklaştırınca dijital sayfaya yönlendiriyor.
        BeyLink profil URL'in bunlarla uyumludur.
      </Callout>

      <H2>Sonuç</H2>
      <P>
        Dijital kartvizit sadece bir trend değil — <strong>yeni tanışma protokolü</strong>. Profesyonel görünmen ve
        güncel kalman için doğru araç. Klasiği bırakmana gerek yok; <strong>birlikte kullan</strong>.
      </P>
      <P>
        <A href="/register">BeyLink ile başla</A>, ilk dijital kartvizitini oluştur, QR'ını yazdır. Bir sonraki toplantıda
        farkı hisset.
      </P>
    </>
  );
}

function PostEn() {
  return (
    <>
      <P>
        When you pull out a digital business card at an introduction, the first thought is: <strong>"This person really
        has their act together."</strong>{' '}
        The classic business card still has its place, but the digital business card is a sign of the times. In this guide
        we show you how to create a professional digital business card.
      </P>

      <H2>Why a digital business card?</H2>
      <UL>
        <li><strong>Updatable:</strong> new job or new phone number, and no cards to reprint.</li>
        <li><strong>Rich content:</strong> not just a name and phone; social media, portfolio, location, video.</li>
        <li><strong>Sharing via QR:</strong> it reaches the other person in 2 seconds.</li>
        <li><strong>Eco-friendly:</strong> no wasted paper.</li>
        <li><strong>Analytics:</strong> who looked when and what they clicked; it's all measurable.</li>
      </UL>

      <H2>What makes a good digital business card?</H2>
      <OL>
        <li><strong>Profile photo:</strong> your face builds a connection. High resolution.</li>
        <li><strong>Name and title:</strong> "Ayşe Yılmaz | Web Designer"</li>
        <li><strong>Short value proposition:</strong> "Modern web design for small businesses"</li>
        <li><strong>vCard download:</strong> so the other person adds you to their contacts in one tap</li>
        <li><strong>WhatsApp / email / phone:</strong> directly clickable</li>
        <li><strong>Social media links:</strong> LinkedIn, Instagram, portfolio</li>
        <li><strong>A short portfolio sample:</strong> your 3–4 best pieces of work</li>
        <li><strong>Location:</strong> a map link if you have an office</li>
      </OL>

      <InlineCta
        title="Create your digital business card in 5 minutes"
        desc="BeyLink's contact block (vCard) and QR code feature are included in the free plan."
        href="/register"
        label="Start Free →"
      />

      <H2>How to create one (step by step)</H2>
      <OL>
        <li><A href="/register">Open a BeyLink account</A> and pick your username</li>
        <li>Add a profile photo and cover image</li>
        <li>Write your name and a one-line description</li>
        <li>Add a <strong>contact block</strong>: email, phone, address (a vCard is created automatically)</li>
        <li>Add your social media blocks</li>
        <li>Add extra links like your portfolio or store</li>
        <li>Publish your page and <strong>download your QR code</strong> (free)</li>
      </OL>

      <H2>6 tips for a professional look</H2>

      <H3>1. A consistent brand color</H3>
      <P>
        Apply the exact color palette you use on social media here too. BeyLink themes are customizable.
      </P>

      <H3>2. A high-resolution photo</H3>
      <P>
        A blurry or poorly lit photo costs you professionalism. A portrait shot in natural light with a clean background
        is best.
      </P>

      <H3>3. Priority order between blocks</H3>
      <P>
        Your most important contact channel (WhatsApp or email?) goes at the top. Social media in the middle, portfolio
        toward the bottom.
      </P>

      <H3>4. Visual coherence</H3>
      <P>
        Social media icons in the same style and same size. BeyLink does this automatically. A cluttered layout doesn't
        suit a digital business card.
      </P>

      <H3>5. A quick-access link</H3>
      <P>
        Make a single clear CTA stand out, like "Book an appointment," "Free discovery call," or "Download my portfolio."
        Your visitor should know exactly what the next step is.
      </P>

      <H3>6. QR + link together</H3>
      <P>
        Don't ditch the classic business card entirely. Print a QR code on the back of your classic card: both
        traditional and modern. Combining the two is the best of both worlds.
      </P>

      <Callout tone="success" title="Bonus: NFC business cards">
        Some professionals use NFC (contactless) business cards: hold it near a phone and it routes to the digital page.
        Your BeyLink profile URL is compatible with these.
      </Callout>

      <H2>Conclusion</H2>
      <P>
        A digital business card isn't just a trend; it's the <strong>new introduction protocol</strong>. It's the right
        tool for looking professional and staying current. You don't have to give up the classic; <strong>use them
        together</strong>.
      </P>
      <P>
        <A href="/register">Start with BeyLink</A>, create your first digital business card, and print your QR. Feel the
        difference at your next meeting.
      </P>
    </>
  );
}

function PostRu() {
  return (
    <>
      <P>
        Когда при знакомстве вы достаёте цифровую визитку, первая мысль собеседника: <strong>«А у этого человека всё
        схвачено».</strong>{' '}
        Классическая визитка всё ещё на своём месте, но цифровая визитка это знак времени. В этом руководстве мы покажем,
        как создать профессиональную цифровую визитку.
      </P>

      <H2>Зачем нужна цифровая визитка?</H2>
      <UL>
        <li><strong>Обновляемая:</strong> новая работа или новый номер, и никаких карточек перепечатывать.</li>
        <li><strong>Богатое содержимое:</strong> не только имя и телефон; соцсети, портфолио, локация, видео.</li>
        <li><strong>Обмен через QR:</strong> она доходит до собеседника за 2 секунды.</li>
        <li><strong>Экологичная:</strong> нет напрасной бумаги.</li>
        <li><strong>Аналитика:</strong> кто и когда смотрел и на что кликнул; всё это измеримо.</li>
      </UL>

      <H2>Что делает цифровую визитку хорошей?</H2>
      <OL>
        <li><strong>Фото профиля:</strong> ваше лицо создаёт связь. Высокое разрешение.</li>
        <li><strong>Имя и должность:</strong> «Анна Петрова | Веб-дизайнер»</li>
        <li><strong>Короткое ценностное предложение:</strong> «Современный веб-дизайн для малого бизнеса»</li>
        <li><strong>Скачивание vCard:</strong> чтобы собеседник добавил вас в контакты в одно касание</li>
        <li><strong>WhatsApp / почта / телефон:</strong> кликабельны напрямую</li>
        <li><strong>Ссылки на соцсети:</strong> LinkedIn, Instagram, портфолио</li>
        <li><strong>Небольшой образец портфолио:</strong> 3-4 ваши лучшие работы</li>
        <li><strong>Локация:</strong> ссылка на карту, если у вас есть офис</li>
      </OL>

      <InlineCta
        title="Создайте цифровую визитку за 5 минут"
        desc="Блок контактов (vCard) и функция QR-кода в BeyLink входят в бесплатный план."
        href="/register"
        label="Начать бесплатно →"
      />

      <H2>Как её создать (шаг за шагом)</H2>
      <OL>
        <li><A href="/register">Откройте аккаунт BeyLink</A> и выберите имя пользователя</li>
        <li>Добавьте фото профиля и обложку</li>
        <li>Напишите имя и описание в одну строку</li>
        <li>Добавьте <strong>блок контактов</strong>: почта, телефон, адрес (vCard создаётся автоматически)</li>
        <li>Добавьте блоки соцсетей</li>
        <li>Добавьте дополнительные ссылки, например портфолио или магазин</li>
        <li>Опубликуйте страницу и <strong>скачайте свой QR-код</strong> (бесплатно)</li>
      </OL>

      <H2>6 советов для профессионального вида</H2>

      <H3>1. Единый фирменный цвет</H3>
      <P>
        Примените здесь ту же цветовую палитру, что и в соцсетях. Темы BeyLink настраиваемые.
      </P>

      <H3>2. Фото в высоком разрешении</H3>
      <P>
        Размытое или плохо освещённое фото стоит вам профессионализма. Лучше всего портрет, снятый при естественном свете
        с чистым фоном.
      </P>

      <H3>3. Порядок приоритета между блоками</H3>
      <P>
        Ваш важнейший канал связи (WhatsApp или почта?) идёт наверх. Соцсети в середине, портфолио ближе к низу.
      </P>

      <H3>4. Визуальная целостность</H3>
      <P>
        Иконки соцсетей в одном стиле и одного размера. BeyLink делает это автоматически. Загромождённая раскладка не идёт
        цифровой визитке.
      </P>

      <H3>5. Ссылка быстрого доступа</H3>
      <P>
        Выделите один чёткий CTA, например «Записаться на приём», «Бесплатная консультация» или «Скачать моё портфолио».
        Ваш посетитель должен точно знать, каков следующий шаг.
      </P>

      <H3>6. QR + ссылка вместе</H3>
      <P>
        Не отказывайтесь от классической визитки полностью. Напечатайте QR-код на обороте классической карточки: и
        традиционно, и современно. Сочетать оба это лучшее из двух миров.
      </P>

      <Callout tone="success" title="Бонус: NFC-визитки">
        Некоторые профессионалы используют NFC-визитки (бесконтактные): поднесите её к телефону, и она открывает цифровую
        страницу. URL вашего профиля BeyLink совместим с ними.
      </Callout>

      <H2>Заключение</H2>
      <P>
        Цифровая визитка это не просто тренд; это <strong>новый протокол знакомства</strong>. Это правильный инструмент,
        чтобы выглядеть профессионально и оставаться актуальным. Отказываться от классической не нужно; <strong>используйте
        их вместе</strong>.
      </P>
      <P>
        <A href="/register">Начните с BeyLink</A>, создайте свою первую цифровую визитку и распечатайте свой QR. Почувствуйте
        разницу на следующей встрече.
      </P>
    </>
  );
}

function PostEs() {
  return (
    <>
      <P>
        Cuando sacas una tarjeta de visita digital en una presentación, el primer pensamiento es: <strong>"Esta persona
        lo tiene todo bajo control."</strong>{' '}
        La tarjeta de visita clásica todavía tiene su sitio, pero la tarjeta digital es una señal de los tiempos. En esta
        guía te mostramos cómo crear una tarjeta de visita digital profesional.
      </P>

      <H2>¿Por qué una tarjeta de visita digital?</H2>
      <UL>
        <li><strong>Actualizable:</strong> nuevo trabajo o nuevo número, y ninguna tarjeta que reimprimir.</li>
        <li><strong>Contenido rico:</strong> no solo un nombre y un teléfono; redes sociales, portafolio, ubicación, vídeo.</li>
        <li><strong>Se comparte por QR:</strong> llega a la otra persona en 2 segundos.</li>
        <li><strong>Ecológica:</strong> sin papel desperdiciado.</li>
        <li><strong>Analítica:</strong> quién la miró, cuándo y en qué hizo clic; todo es medible.</li>
      </UL>

      <H2>¿Qué hace buena a una tarjeta de visita digital?</H2>
      <OL>
        <li><strong>Foto de perfil:</strong> tu cara crea conexión. Alta resolución.</li>
        <li><strong>Nombre y cargo:</strong> "Ana García | Diseñadora web"</li>
        <li><strong>Propuesta de valor breve:</strong> "Diseño web moderno para pequeñas empresas"</li>
        <li><strong>Descarga de vCard:</strong> para que la otra persona te añada a sus contactos con un toque</li>
        <li><strong>WhatsApp / correo / teléfono:</strong> clicables directamente</li>
        <li><strong>Enlaces a redes sociales:</strong> LinkedIn, Instagram, portafolio</li>
        <li><strong>Una pequeña muestra de portafolio:</strong> tus 3 o 4 mejores trabajos</li>
        <li><strong>Ubicación:</strong> un enlace a mapa si tienes oficina</li>
      </OL>

      <InlineCta
        title="Crea tu tarjeta de visita digital en 5 minutos"
        desc="El bloque de contacto (vCard) y la función de código QR de BeyLink están incluidos en el plan gratuito."
        href="/register"
        label="Empieza gratis →"
      />

      <H2>Cómo crearla (paso a paso)</H2>
      <OL>
        <li><A href="/register">Abre una cuenta de BeyLink</A> y elige tu nombre de usuario</li>
        <li>Añade una foto de perfil y una imagen de portada</li>
        <li>Escribe tu nombre y una descripción de una línea</li>
        <li>Añade un <strong>bloque de contacto</strong>: correo, teléfono, dirección (la vCard se crea automáticamente)</li>
        <li>Añade tus bloques de redes sociales</li>
        <li>Añade enlaces extra como tu portafolio o tu tienda</li>
        <li>Publica tu página y <strong>descarga tu código QR</strong> (gratis)</li>
      </OL>

      <H2>6 consejos para un aspecto profesional</H2>

      <H3>1. Un color de marca coherente</H3>
      <P>
        Aplica aquí también la misma paleta de colores que usas en redes sociales. Los temas de BeyLink son personalizables.
      </P>

      <H3>2. Una foto en alta resolución</H3>
      <P>
        Una foto borrosa o mal iluminada te resta profesionalidad. Lo mejor es un retrato tomado con luz natural y un
        fondo limpio.
      </P>

      <H3>3. Orden de prioridad entre bloques</H3>
      <P>
        Tu canal de contacto más importante (¿WhatsApp o correo?) va arriba. Las redes sociales en el medio, el
        portafolio hacia abajo.
      </P>

      <H3>4. Coherencia visual</H3>
      <P>
        Iconos de redes sociales del mismo estilo y del mismo tamaño. BeyLink lo hace automáticamente. Una disposición
        recargada no le sienta bien a una tarjeta de visita digital.
      </P>

      <H3>5. Un enlace de acceso rápido</H3>
      <P>
        Haz que destaque un único CTA claro, como "Reservar una cita", "Llamada de descubrimiento gratis" o "Descargar mi
        portafolio". Tu visitante debe saber exactamente cuál es el siguiente paso.
      </P>

      <H3>6. QR + enlace juntos</H3>
      <P>
        No abandones del todo la tarjeta de visita clásica. Imprime un código QR en el reverso de tu tarjeta clásica:
        tradicional y moderna a la vez. Combinar las dos es lo mejor de ambos mundos.
      </P>

      <Callout tone="success" title="Extra: tarjetas de visita NFC">
        Algunos profesionales usan tarjetas de visita NFC (sin contacto): acércala a un teléfono y te lleva a la página
        digital. La URL de tu perfil de BeyLink es compatible con ellas.
      </Callout>

      <H2>Conclusión</H2>
      <P>
        Una tarjeta de visita digital no es solo una moda; es el <strong>nuevo protocolo de presentación</strong>. Es la
        herramienta adecuada para dar una imagen profesional y mantenerte al día. No tienes que renunciar a la clásica;
        <strong> úsalas juntas</strong>.
      </P>
      <P>
        <A href="/register">Empieza con BeyLink</A>, crea tu primera tarjeta de visita digital e imprime tu QR. Nota la
        diferencia en tu próxima reunión.
      </P>
    </>
  );
}

function PostDe() {
  return (
    <>
      <P>
        Wenn du bei einem Kennenlernen eine digitale Visitenkarte zückst, ist der erste Gedanke: <strong>„Diese Person
        hat ihren Laden im Griff.“</strong>{' '}
        Die klassische Visitenkarte hat weiterhin ihren Platz, aber die digitale Visitenkarte ist ein Zeichen der Zeit. In
        diesem Guide zeigen wir dir, wie du eine professionelle digitale Visitenkarte erstellst.
      </P>

      <H2>Warum eine digitale Visitenkarte?</H2>
      <UL>
        <li><strong>Aktualisierbar:</strong> neuer Job oder neue Telefonnummer, und keine Karten zum Nachdrucken.</li>
        <li><strong>Reicher Content:</strong> nicht nur Name und Telefon; Social Media, Portfolio, Standort, Video.</li>
        <li><strong>Teilen per QR:</strong> sie erreicht die andere Person in 2 Sekunden.</li>
        <li><strong>Umweltfreundlich:</strong> kein verschwendetes Papier.</li>
        <li><strong>Analysen:</strong> wer wann geschaut und was geklickt hat; alles messbar.</li>
      </UL>

      <H2>Was macht eine gute digitale Visitenkarte aus?</H2>
      <OL>
        <li><strong>Profilbild:</strong> dein Gesicht schafft eine Verbindung. Hohe Auflösung.</li>
        <li><strong>Name und Titel:</strong> „Lena Fischer | Webdesignerin“</li>
        <li><strong>Kurzes Wertversprechen:</strong> „Modernes Webdesign für kleine Unternehmen“</li>
        <li><strong>vCard-Download:</strong> damit die andere Person dich mit einem Tipp zu ihren Kontakten hinzufügt</li>
        <li><strong>WhatsApp / E-Mail / Telefon:</strong> direkt klickbar</li>
        <li><strong>Social-Media-Links:</strong> LinkedIn, Instagram, Portfolio</li>
        <li><strong>Eine kurze Portfolio-Kostprobe:</strong> deine 3 bis 4 besten Arbeiten</li>
        <li><strong>Standort:</strong> ein Karten-Link, wenn du ein Büro hast</li>
      </OL>

      <InlineCta
        title="Erstelle deine digitale Visitenkarte in 5 Minuten"
        desc="Der Kontaktblock (vCard) und die QR-Code-Funktion von BeyLink sind im Free-Tarif enthalten."
        href="/register"
        label="Kostenlos starten →"
      />

      <H2>So erstellst du eine (Schritt für Schritt)</H2>
      <OL>
        <li><A href="/register">Eröffne ein BeyLink-Konto</A> und wähle deinen Benutzernamen</li>
        <li>Füge ein Profilbild und ein Titelbild hinzu</li>
        <li>Schreib deinen Namen und eine einzeilige Beschreibung</li>
        <li>Füge einen <strong>Kontaktblock</strong> hinzu: E-Mail, Telefon, Adresse (eine vCard wird automatisch erstellt)</li>
        <li>Füge deine Social-Media-Blöcke hinzu</li>
        <li>Füge zusätzliche Links wie dein Portfolio oder deinen Shop hinzu</li>
        <li>Veröffentliche deine Seite und <strong>lade deinen QR-Code herunter</strong> (kostenlos)</li>
      </OL>

      <H2>6 Tipps für einen professionellen Look</H2>

      <H3>1. Eine konsistente Markenfarbe</H3>
      <P>
        Wende hier dieselbe Farbpalette an, die du in Social Media nutzt. BeyLink-Themes sind anpassbar.
      </P>

      <H3>2. Ein hochauflösendes Foto</H3>
      <P>
        Ein unscharfes oder schlecht ausgeleuchtetes Foto kostet dich Professionalität. Am besten ist ein Porträt, bei
        natürlichem Licht mit sauberem Hintergrund aufgenommen.
      </P>

      <H3>3. Prioritätsreihenfolge zwischen den Blöcken</H3>
      <P>
        Dein wichtigster Kontaktkanal (WhatsApp oder E-Mail?) kommt nach oben. Social Media in die Mitte, das Portfolio
        weiter nach unten.
      </P>

      <H3>4. Visuelle Kohärenz</H3>
      <P>
        Social-Media-Icons im gleichen Stil und in gleicher Größe. BeyLink macht das automatisch. Ein überladenes Layout
        passt nicht zu einer digitalen Visitenkarte.
      </P>

      <H3>5. Ein Schnellzugriffs-Link</H3>
      <P>
        Lass einen einzigen klaren CTA hervorstechen, etwa „Termin buchen“, „Kostenloses Erstgespräch“ oder „Mein
        Portfolio herunterladen“. Dein Besucher soll genau wissen, was der nächste Schritt ist.
      </P>

      <H3>6. QR + Link zusammen</H3>
      <P>
        Wirf die klassische Visitenkarte nicht komplett weg. Drucke einen QR-Code auf die Rückseite deiner klassischen
        Karte: traditionell und modern zugleich. Beides zu kombinieren, ist das Beste aus beiden Welten.
      </P>

      <Callout tone="success" title="Bonus: NFC-Visitenkarten">
        Manche Profis nutzen NFC-Visitenkarten (kontaktlos): Halte sie an ein Handy, und sie leitet auf die digitale
        Seite weiter. Deine BeyLink-Profil-URL ist damit kompatibel.
      </Callout>

      <H2>Fazit</H2>
      <P>
        Eine digitale Visitenkarte ist nicht nur ein Trend; sie ist das <strong>neue Kennenlern-Protokoll</strong>. Sie
        ist das richtige Werkzeug, um professionell zu wirken und am Puls der Zeit zu bleiben. Du musst die klassische
        nicht aufgeben; <strong>nutze sie zusammen</strong>.
      </P>
      <P>
        <A href="/register">Leg mit BeyLink los</A>, erstelle deine erste digitale Visitenkarte und drucke deinen QR.
        Spüre den Unterschied bei deinem nächsten Meeting.
      </P>
    </>
  );
}

function PostFr() {
  return (
    <>
      <P>
        Quand vous sortez une carte de visite numérique lors d'une rencontre, la première pensée est : <strong>« Cette
        personne maîtrise vraiment son affaire. »</strong>{' '}
        La carte de visite classique garde sa place, mais la carte de visite numérique est un signe des temps. Dans ce
        guide, nous vous montrons comment créer une carte de visite numérique professionnelle.
      </P>

      <H2>Pourquoi une carte de visite numérique ?</H2>
      <UL>
        <li><strong>Actualisable :</strong> nouveau poste ou nouveau numéro, et aucune carte à réimprimer.</li>
        <li><strong>Contenu riche :</strong> pas seulement un nom et un téléphone ; réseaux sociaux, portfolio, adresse, vidéo.</li>
        <li><strong>Partage par QR :</strong> elle atteint l'autre personne en 2 secondes.</li>
        <li><strong>Écologique :</strong> pas de papier gaspillé.</li>
        <li><strong>Statistiques :</strong> qui l'a consultée, quand et sur quoi elle a cliqué ; tout est mesurable.</li>
      </UL>

      <H2>Qu'est-ce qui fait une bonne carte de visite numérique ?</H2>
      <OL>
        <li><strong>Photo de profil :</strong> votre visage crée un lien. Haute résolution.</li>
        <li><strong>Nom et fonction :</strong> « Léa Martin | Designeuse web »</li>
        <li><strong>Proposition de valeur courte :</strong> « Design web moderne pour les petites entreprises »</li>
        <li><strong>Téléchargement de la vCard :</strong> pour que l'autre personne vous ajoute à ses contacts d'un seul tap</li>
        <li><strong>WhatsApp / e-mail / téléphone :</strong> directement cliquables</li>
        <li><strong>Liens vers les réseaux sociaux :</strong> LinkedIn, Instagram, portfolio</li>
        <li><strong>Un petit échantillon de portfolio :</strong> vos 3 ou 4 meilleurs travaux</li>
        <li><strong>Adresse :</strong> un lien vers une carte si vous avez un bureau</li>
      </OL>

      <InlineCta
        title="Créez votre carte de visite numérique en 5 minutes"
        desc="Le bloc de contact (vCard) et la fonction QR code de BeyLink sont inclus dans le forfait gratuit."
        href="/register"
        label="Commencer gratuitement →"
      />

      <H2>Comment en créer une (étape par étape)</H2>
      <OL>
        <li><A href="/register">Ouvrez un compte BeyLink</A> et choisissez votre nom d'utilisateur</li>
        <li>Ajoutez une photo de profil et une image de couverture</li>
        <li>Écrivez votre nom et une description en une ligne</li>
        <li>Ajoutez un <strong>bloc de contact</strong> : e-mail, téléphone, adresse (une vCard est créée automatiquement)</li>
        <li>Ajoutez vos blocs de réseaux sociaux</li>
        <li>Ajoutez des liens supplémentaires comme votre portfolio ou votre boutique</li>
        <li>Publiez votre page et <strong>téléchargez votre QR code</strong> (gratuit)</li>
      </OL>

      <H2>6 astuces pour un rendu professionnel</H2>

      <H3>1. Une couleur de marque cohérente</H3>
      <P>
        Appliquez ici aussi la palette de couleurs exacte que vous utilisez sur les réseaux sociaux. Les thèmes BeyLink
        sont personnalisables.
      </P>

      <H3>2. Une photo en haute résolution</H3>
      <P>
        Une photo floue ou mal éclairée vous coûte en professionnalisme. Le mieux est un portrait pris à la lumière
        naturelle, avec un arrière-plan épuré.
      </P>

      <H3>3. Un ordre de priorité entre les blocs</H3>
      <P>
        Votre canal de contact le plus important (WhatsApp ou e-mail ?) va tout en haut. Les réseaux sociaux au milieu,
        le portfolio vers le bas.
      </P>

      <H3>4. La cohérence visuelle</H3>
      <P>
        Des icônes de réseaux sociaux dans le même style et la même taille. BeyLink le fait automatiquement. Une mise en
        page surchargée ne convient pas à une carte de visite numérique.
      </P>

      <H3>5. Un lien d'accès rapide</H3>
      <P>
        Faites ressortir un seul CTA clair, comme « Prendre rendez-vous », « Appel découverte gratuit » ou « Télécharger
        mon portfolio ». Votre visiteur doit savoir exactement quelle est l'étape suivante.
      </P>

      <H3>6. QR + lien ensemble</H3>
      <P>
        N'abandonnez pas totalement la carte de visite classique. Imprimez un QR code au dos de votre carte classique :
        à la fois traditionnelle et moderne. Combiner les deux, c'est le meilleur des deux mondes.
      </P>

      <Callout tone="success" title="Bonus : les cartes de visite NFC">
        Certains professionnels utilisent des cartes de visite NFC (sans contact) : approchez-la d'un téléphone et elle
        renvoie vers la page numérique. L'URL de votre profil BeyLink est compatible avec elles.
      </Callout>

      <H2>Conclusion</H2>
      <P>
        Une carte de visite numérique n'est pas qu'une mode ; c'est le <strong>nouveau protocole de présentation</strong>.
        C'est le bon outil pour paraître professionnel et rester dans l'air du temps. Vous n'avez pas à renoncer à la
        classique ; <strong>utilisez-les ensemble</strong>.
      </P>
      <P>
        <A href="/register">Lancez-vous avec BeyLink</A>, créez votre première carte de visite numérique et imprimez votre
        QR. Sentez la différence à votre prochaine réunion.
      </P>
    </>
  );
}

function PostPt() {
  return (
    <>
      <P>
        Quando você tira um cartão de visita digital em uma apresentação, o primeiro pensamento é: <strong>"Essa pessoa
        realmente tem tudo em ordem."</strong>{' '}
        O cartão de visita clássico ainda tem o seu lugar, mas o cartão de visita digital é um sinal dos tempos. Neste guia
        mostramos como criar um cartão de visita digital profissional.
      </P>

      <H2>Por que um cartão de visita digital?</H2>
      <UL>
        <li><strong>Atualizável:</strong> emprego novo ou número novo, e nenhum cartão para reimprimir.</li>
        <li><strong>Conteúdo rico:</strong> não só nome e telefone; redes sociais, portfólio, localização, vídeo.</li>
        <li><strong>Compartilhamento via QR:</strong> chega à outra pessoa em 2 segundos.</li>
        <li><strong>Ecológico:</strong> sem desperdício de papel.</li>
        <li><strong>Análises:</strong> quem viu, quando e no que clicou; tudo mensurável.</li>
      </UL>

      <H2>O que faz um bom cartão de visita digital?</H2>
      <OL>
        <li><strong>Foto de perfil:</strong> o seu rosto cria conexão. Alta resolução.</li>
        <li><strong>Nome e cargo:</strong> "Camila Souza | Designer Web"</li>
        <li><strong>Proposta de valor curta:</strong> "Design web moderno para pequenos negócios"</li>
        <li><strong>Download da vCard:</strong> para a outra pessoa te adicionar aos contatos com um toque</li>
        <li><strong>WhatsApp / e-mail / telefone:</strong> clicáveis diretamente</li>
        <li><strong>Links de redes sociais:</strong> LinkedIn, Instagram, portfólio</li>
        <li><strong>Uma pequena amostra de portfólio:</strong> os seus 3-4 melhores trabalhos</li>
        <li><strong>Localização:</strong> um link de mapa se você tiver um escritório</li>
      </OL>

      <InlineCta
        title="Crie o seu cartão de visita digital em 5 minutos"
        desc="O bloco de contato (vCard) e o recurso de código QR do BeyLink estão incluídos no plano gratuito."
        href="/register"
        label="Comece grátis →"
      />

      <H2>Como criar um (passo a passo)</H2>
      <OL>
        <li><A href="/register">Abra uma conta BeyLink</A> e escolha o seu nome de usuário</li>
        <li>Adicione uma foto de perfil e uma imagem de capa</li>
        <li>Escreva o seu nome e uma descrição de uma linha</li>
        <li>Adicione um <strong>bloco de contato</strong>: e-mail, telefone, endereço (uma vCard é criada automaticamente)</li>
        <li>Adicione os seus blocos de redes sociais</li>
        <li>Adicione links extras, como o seu portfólio ou a sua loja</li>
        <li>Publique a sua página e <strong>baixe o seu código QR</strong> (grátis)</li>
      </OL>

      <H2>6 dicas para um visual profissional</H2>

      <H3>1. Uma cor de marca consistente</H3>
      <P>
        Aplique aqui também a mesma paleta de cores que você usa nas redes sociais. Os temas do BeyLink são personalizáveis.
      </P>

      <H3>2. Uma foto em alta resolução</H3>
      <P>
        Uma foto borrada ou mal iluminada custa a sua imagem profissional. O melhor é um retrato feito com luz natural e
        fundo limpo.
      </P>

      <H3>3. Ordem de prioridade entre os blocos</H3>
      <P>
        O seu canal de contato mais importante (WhatsApp ou e-mail?) vai no topo. As redes sociais no meio, o portfólio
        mais para baixo.
      </P>

      <H3>4. Coerência visual</H3>
      <P>
        Ícones de redes sociais no mesmo estilo e no mesmo tamanho. O BeyLink faz isso automaticamente. Um layout
        carregado não combina com um cartão de visita digital.
      </P>

      <H3>5. Um link de acesso rápido</H3>
      <P>
        Faça um único CTA claro se destacar, como "Agendar um horário", "Conversa inicial gratuita" ou "Baixar o meu
        portfólio". O seu visitante deve saber exatamente qual é o próximo passo.
      </P>

      <H3>6. QR + link juntos</H3>
      <P>
        Não abandone de vez o cartão de visita clássico. Imprima um código QR no verso do seu cartão clássico: tradicional
        e moderno ao mesmo tempo. Combinar os dois é o melhor dos dois mundos.
      </P>

      <Callout tone="success" title="Bônus: cartões de visita NFC">
        Alguns profissionais usam cartões de visita NFC (sem contato): aproxime de um celular e ele leva para a página
        digital. A URL do seu perfil BeyLink é compatível com eles.
      </Callout>

      <H2>Conclusão</H2>
      <P>
        Um cartão de visita digital não é só uma moda; é o <strong>novo protocolo de apresentação</strong>. É a
        ferramenta certa para parecer profissional e se manter atualizado. Você não precisa abrir mão do clássico;
        <strong> use os dois juntos</strong>.
      </P>
      <P>
        <A href="/register">Comece com o BeyLink</A>, crie o seu primeiro cartão de visita digital e imprima o seu QR.
        Sinta a diferença na sua próxima reunião.
      </P>
    </>
  );
}

function PostIt() {
  return (
    <>
      <P>
        Quando tiri fuori un biglietto da visita digitale a una presentazione, il primo pensiero è: <strong>"Questa
        persona sa il fatto suo."</strong>{' '}
        Il biglietto da visita classico ha ancora il suo posto, ma quello digitale è un segno dei tempi. In questa guida
        ti mostriamo come creare un biglietto da visita digitale professionale.
      </P>

      <H2>Perché un biglietto da visita digitale?</H2>
      <UL>
        <li><strong>Aggiornabile:</strong> nuovo lavoro o nuovo numero, e nessun biglietto da ristampare.</li>
        <li><strong>Contenuti ricchi:</strong> non solo nome e telefono; social, portfolio, posizione, video.</li>
        <li><strong>Condivisione via QR:</strong> arriva all'altra persona in 2 secondi.</li>
        <li><strong>Ecologico:</strong> niente carta sprecata.</li>
        <li><strong>Statistiche:</strong> chi ha guardato quando e cosa ha cliccato; è tutto misurabile.</li>
      </UL>

      <H2>Cosa rende buono un biglietto da visita digitale?</H2>
      <OL>
        <li><strong>Foto profilo:</strong> il tuo volto crea un legame. Alta risoluzione.</li>
        <li><strong>Nome e titolo:</strong> "Giulia Rossi | Web Designer"</li>
        <li><strong>Breve proposta di valore:</strong> "Web design moderno per piccole attività"</li>
        <li><strong>Download vCard:</strong> così l'altra persona ti aggiunge ai contatti con un tap</li>
        <li><strong>WhatsApp / e-mail / telefono:</strong> direttamente cliccabili</li>
        <li><strong>Link ai social:</strong> LinkedIn, Instagram, portfolio</li>
        <li><strong>Un breve estratto del portfolio:</strong> i tuoi 3-4 lavori migliori</li>
        <li><strong>Posizione:</strong> un link alla mappa se hai un ufficio</li>
      </OL>

      <InlineCta
        title="Crea il tuo biglietto da visita digitale in 5 minuti"
        desc="Il blocco di contatto (vCard) e la funzione codice QR di BeyLink sono inclusi nel piano gratuito."
        href="/register"
        label="Inizia gratis →"
      />

      <H2>Come crearne uno (passo dopo passo)</H2>
      <OL>
        <li><A href="/register">Apri un account BeyLink</A> e scegli il tuo nome utente</li>
        <li>Aggiungi una foto profilo e un'immagine di copertina</li>
        <li>Scrivi il tuo nome e una descrizione di una riga</li>
        <li>Aggiungi un <strong>blocco di contatto</strong>: e-mail, telefono, indirizzo (la vCard viene creata in automatico)</li>
        <li>Aggiungi i tuoi blocchi social</li>
        <li>Aggiungi link extra come il tuo portfolio o il tuo negozio</li>
        <li>Pubblica la tua pagina e <strong>scarica il tuo codice QR</strong> (gratis)</li>
      </OL>

      <H2>6 consigli per un look professionale</H2>

      <H3>1. Un colore del brand coerente</H3>
      <P>
        Applica anche qui la stessa palette di colori che usi sui social. I temi di BeyLink sono personalizzabili.
      </P>

      <H3>2. Una foto ad alta risoluzione</H3>
      <P>
        Una foto sfocata o con poca luce ti fa perdere professionalità. Un ritratto scattato con luce naturale e uno
        sfondo pulito è la scelta migliore.
      </P>

      <H3>3. Ordine di priorità tra i blocchi</H3>
      <P>
        Il tuo canale di contatto più importante (WhatsApp o e-mail?) va in cima. I social al centro, il portfolio verso
        il fondo.
      </P>

      <H3>4. Coerenza visiva</H3>
      <P>
        Icone social dello stesso stile e della stessa dimensione. BeyLink lo fa in automatico. Un layout confuso non si
        addice a un biglietto da visita digitale.
      </P>

      <H3>5. Un link ad accesso rapido</H3>
      <P>
        Fai risaltare un'unica CTA chiara, come "Prenota un appuntamento", "Call conoscitiva gratuita" o "Scarica il mio
        portfolio". Il tuo visitatore deve sapere esattamente qual è il passo successivo.
      </P>

      <H3>6. QR + link insieme</H3>
      <P>
        Non abbandonare del tutto il biglietto da visita classico. Stampa un codice QR sul retro del tuo biglietto
        classico: tradizionale e moderno insieme. Unire i due è il meglio di entrambi i mondi.
      </P>

      <Callout tone="success" title="Bonus: biglietti da visita NFC">
        Alcuni professionisti usano biglietti da visita NFC (contactless): li avvicini a un telefono e questo apre la
        pagina digitale. L'URL del tuo profilo BeyLink è compatibile con questi biglietti.
      </Callout>

      <H2>Conclusione</H2>
      <P>
        Un biglietto da visita digitale non è solo una moda; è il <strong>nuovo protocollo di presentazione</strong>. È
        lo strumento giusto per apparire professionale e restare al passo. Non devi rinunciare al classico;
        <strong> usali insieme</strong>.
      </P>
      <P>
        <A href="/register">Inizia con BeyLink</A>, crea il tuo primo biglietto da visita digitale e stampa il tuo QR.
        Senti la differenza al tuo prossimo incontro.
      </P>
    </>
  );
}

function PostJa() {
  return (
    <>
      <P>
        紹介の場でデジタル名刺を取り出すと、相手はまずこう思います。<strong>「この人、ちゃんとしてるな」</strong>。{' '}
        紙の名刺にも今なお役割はありますが、デジタル名刺は時代の流れそのものです。このガイドでは、プロらしいデジタル名刺の作り方を紹介します。
      </P>

      <H2>なぜデジタル名刺なのか？</H2>
      <UL>
        <li><strong>更新できる：</strong>転職しても電話番号が変わっても、名刺を刷り直す必要はありません。</li>
        <li><strong>リッチな内容：</strong>名前と電話だけでなく、SNS、ポートフォリオ、場所、動画まで。</li>
        <li><strong>QRで共有：</strong>2秒で相手に届きます。</li>
        <li><strong>エコ：</strong>紙のムダがありません。</li>
        <li><strong>アナリティクス：</strong>誰がいつ見て、何をクリックしたか。すべて計測できます。</li>
      </UL>

      <H2>良いデジタル名刺の条件とは？</H2>
      <OL>
        <li><strong>プロフィール写真：</strong>顔があるとつながりが生まれます。高解像度で。</li>
        <li><strong>名前と肩書き：</strong>「佐藤大輔 | Webデザイナー」</li>
        <li><strong>短い価値提案：</strong>「スモールビジネスのためのモダンなWebデザイン」</li>
        <li><strong>vCardのダウンロード：</strong>相手がワンタップで連絡先に追加できるように</li>
        <li><strong>WhatsApp / メール / 電話：</strong>直接タップできる形で</li>
        <li><strong>SNSリンク：</strong>LinkedIn、Instagram、ポートフォリオ</li>
        <li><strong>短いポートフォリオの見本：</strong>自信のある3〜4点の実績</li>
        <li><strong>場所：</strong>オフィスがあるなら地図リンクを</li>
      </OL>

      <InlineCta
        title="デジタル名刺を5分で作る"
        desc="BeyLinkの連絡先ブロック（vCard）とQRコード機能は、無料プランに含まれています。"
        href="/register"
        label="無料で始める →"
      />

      <H2>作り方（ステップ・バイ・ステップ）</H2>
      <OL>
        <li><A href="/register">BeyLinkのアカウントを作り</A>、ユーザーネームを選ぶ</li>
        <li>プロフィール写真とカバー画像を追加する</li>
        <li>名前と一行の説明を書く</li>
        <li><strong>連絡先ブロック</strong>を追加する。メール、電話、住所（vCardは自動で作られます）</li>
        <li>SNSのブロックを追加する</li>
        <li>ポートフォリオやショップなどの追加リンクを入れる</li>
        <li>ページを公開し、<strong>QRコードをダウンロードする</strong>（無料）</li>
      </OL>

      <H2>プロらしく見せる6つのコツ</H2>

      <H3>1. 統一したブランドカラー</H3>
      <P>
        SNSで使っているのとまったく同じカラーパレットを、ここでも適用しましょう。BeyLinkのテーマはカスタマイズできます。
      </P>

      <H3>2. 高解像度の写真</H3>
      <P>
        ぼやけた写真や暗い写真は、プロらしさを損ないます。背景がすっきりした、自然光のポートレートがおすすめです。
      </P>

      <H3>3. ブロックの優先順位</H3>
      <P>
        いちばん重要な連絡手段（WhatsAppかメールか？）を上に。SNSは真ん中、ポートフォリオは下のほうに置きましょう。
      </P>

      <H3>4. ビジュアルの一貫性</H3>
      <P>
        SNSアイコンは同じスタイル、同じサイズで。BeyLinkはこれを自動で行います。ごちゃごちゃしたレイアウトはデジタル名刺に合いません。
      </P>

      <H3>5. すぐ押せるリンク</H3>
      <P>
        「予約する」「無料の初回相談」「ポートフォリオをダウンロード」など、明確なCTAを1つだけ目立たせましょう。
        訪問者が次の一歩を迷わないようにするのです。
      </P>

      <H3>6. QRとリンクを合わせて</H3>
      <P>
        紙の名刺を完全に捨てる必要はありません。紙の名刺の裏にQRコードを印刷しましょう。伝統とモダンの両立です。
        2つを組み合わせるのが、いいとこ取りの方法です。
      </P>

      <Callout tone="success" title="ボーナス：NFC名刺">
        NFC（非接触）名刺を使うプロもいます。スマホにかざすとデジタルページに飛ぶしくみです。BeyLinkのプロフィールURLは、これらと互換性があります。
      </Callout>

      <H2>まとめ</H2>
      <P>
        デジタル名刺は単なる流行ではなく、<strong>新しい自己紹介のプロトコル</strong>です。プロらしく見え、時代に乗り続けるための最適なツールです。
        紙をあきらめる必要はありません。<strong>両方を組み合わせて使いましょう</strong>。
      </P>
      <P>
        <A href="/register">BeyLinkで始めて</A>、最初のデジタル名刺を作り、QRを印刷しましょう。次の打ち合わせで、その差を実感できます。
      </P>
    </>
  );
}

export default function Post() {
  const { lang } = useLanguage();
  return lang === 'ja' ? <PostJa /> : lang === 'it' ? <PostIt /> : lang === 'pt' ? <PostPt /> : lang === 'fr' ? <PostFr /> : lang === 'de' ? <PostDe /> : lang === 'ru' ? <PostRu /> : lang === 'es' ? <PostEs /> : lang === 'en' ? <PostEn /> : <PostTr />;
}
