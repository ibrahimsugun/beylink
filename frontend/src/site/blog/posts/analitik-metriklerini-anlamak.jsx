import { H2, H3, P, UL, OL, A, Callout, InlineCta } from '../PostBody.jsx';
import { useLanguage } from '../../../context/LanguageContext.jsx';

export const meta = {
  slug: 'understanding-link-analytics',
  title: {
    tr: 'Link Analitik Metriklerini Anlamak: Hangi Rakam Ne Anlatır?',
    en: 'Understanding Link Analytics Metrics: What Each Means',
    ru: 'Метрики аналитики ссылок: что означает каждая?',
    es: 'Métricas de analítica de enlaces: qué significa cada una',
    de: 'Link-Analyse-Metriken verstehen: Was jede bedeutet',
    fr: 'Comprendre les métriques d\'analyse de liens',
    pt: 'Entenda as métricas de análise de links',
    it: 'Metriche di analisi dei link: cosa significano',
    ja: 'リンク分析の指標を理解する：各数値の意味',
  },
  description: {
    tr: 'Tıklama, tekil ziyaretçi, CTR, bounce rate — link analitiğindeki metrikler ne anlama gelir? Ölçmen gereken 8 anahtar rakam.',
    en: 'Clicks, unique visitors, CTR, bounce rate: what do link analytics metrics mean? The 8 key numbers you need to measure.',
    ru: 'Клики, уникальные посетители, CTR, показатель отказов: что означают метрики аналитики ссылок? 8 ключевых чисел для измерения.',
    es: 'Clics, visitantes únicos, CTR, tasa de rebote: ¿qué significan las métricas de analítica de enlaces? Los 8 números clave que debes medir.',
    de: 'Klicks, Unique Visitors, CTR, Absprungrate: Was bedeuten die Metriken der Link-Analyse? Die 8 wichtigsten Zahlen, die du messen musst.',
    fr: 'Clics, visiteurs uniques, CTR, taux de rebond : que signifient les métriques d\'analyse de liens ? Les 8 chiffres clés à mesurer.',
    pt: 'Cliques, visitantes únicos, CTR, taxa de rejeição: o que significam as métricas de análise de links? Os 8 números-chave para medir.',
    it: 'Clic, visitatori unici, CTR, frequenza di rimbalzo: cosa significano le metriche di analisi dei link? Gli 8 numeri chiave da misurare.',
    ja: 'クリック、ユニークビジター、CTR、直帰率。リンク分析の指標は何を意味するのか。計測すべき8つの重要な数値を解説します。',
  },
  category: 'optimizasyon',
  tags: {
    tr: ['analitik', 'metrik', 'ctr', 'ölçüm'],
    en: ['analytics', 'metrics', 'ctr', 'measurement'],
    ru: ['аналитика', 'метрики', 'ctr', 'измерение'],
    es: ['analítica', 'métricas', 'ctr', 'medición'],
    de: ['analyse', 'metriken', 'ctr', 'messung'],
    fr: ['statistiques', 'métriques', 'ctr', 'mesure'],
    pt: ['análise', 'métricas', 'ctr', 'medição'],
    it: ['analisi', 'metriche', 'ctr', 'misurazione'],
    ja: ['分析', '指標', 'ctr', '計測'],
  },
  publishedAt: '2026-07-07',
  updatedAt: '2026-07-07',
  readingMinutes: 6,
  image: '/og-image.png',
  faq: {
    tr: [
      { q: 'CTR neye göre yüksek sayılır?', a: 'Sektöre ve platforma göre değişir. Instagram bio linki için %2-5 iyi, %10+ mükemmel. E-posta bültenlerinde %3-8 tipik.' },
      { q: 'Tekil ziyaretçi mi, toplam tıklama mı daha önemli?', a: 'Kısa vadede toplam tıklama gösteri (marka farkındalığı), tekil ziyaretçi gerçek erişim ölçüsü. Uzun vadede ikisini birlikte izlemek gerekir.' },
      { q: 'Bounce rate ne demek?', a: 'Sayfayı açtıktan sonra hiçbir etkileşim yapmadan hemen çıkanların oranı. Yüksek bounce rate sayfada ya içerik ya da yükleme hızı sorunu var demektir.' },
    ],
    en: [
      { q: 'What counts as a high CTR?', a: 'It varies by industry and platform. For an Instagram bio link, 2-5% is good and 10%+ is excellent. In email newsletters, 3-8% is typical.' },
      { q: 'Which matters more, unique visitors or total clicks?', a: 'In the short term, total clicks show reach (brand awareness), while unique visitors are the true measure of reach. In the long term you need to track both together.' },
      { q: 'What does bounce rate mean?', a: 'The share of people who leave right after opening the page without any interaction. A high bounce rate means the page has either a content or a load-speed problem.' },
    ],
    ru: [
      { q: 'Какой CTR считается высоким?', a: 'Зависит от отрасли и платформы. Для ссылки в Instagram-био 2-5% это хорошо, а 10%+ отлично. В почтовых рассылках 3-8% это типично.' },
      { q: 'Что важнее, уникальные посетители или общее число кликов?', a: 'В краткосрочной перспективе общее число кликов показывает охват (узнаваемость бренда), а уникальные посетители это истинная мера охвата. В долгосрочной перспективе нужно отслеживать оба вместе.' },
      { q: 'Что значит показатель отказов?', a: 'Доля людей, которые уходят сразу после открытия страницы без всякого взаимодействия. Высокий показатель отказов означает, что у страницы проблема либо с контентом, либо со скоростью загрузки.' },
    ],
    es: [
      { q: '¿Cuándo se considera alto un CTR?', a: 'Varía según el sector y la plataforma. Para un enlace en la bio de Instagram, un 2-5% es bueno y un 10%+ es excelente. En las newsletters de correo, un 3-8% es lo habitual.' },
      { q: '¿Qué importa más, los visitantes únicos o los clics totales?', a: 'A corto plazo, los clics totales muestran alcance (notoriedad de marca), mientras que los visitantes únicos son la medida real del alcance. A largo plazo hay que seguir ambos juntos.' },
      { q: '¿Qué significa la tasa de rebote?', a: 'La proporción de personas que se van justo después de abrir la página sin ninguna interacción. Una tasa de rebote alta significa que la página tiene un problema de contenido o de velocidad de carga.' },
    ],
    de: [
      { q: 'Ab wann gilt eine CTR als hoch?', a: 'Das hängt von Branche und Plattform ab. Für einen Instagram-Bio-Link sind 2-5 % gut und 10 %+ hervorragend. In E-Mail-Newslettern sind 3-8 % typisch.' },
      { q: 'Was zählt mehr, Unique Visitors oder Gesamtklicks?', a: 'Kurzfristig zeigen Gesamtklicks Reichweite (Markenbekanntheit), während Unique Visitors das echte Maß für Reichweite sind. Langfristig musst du beide gemeinsam verfolgen.' },
      { q: 'Was bedeutet die Absprungrate?', a: 'Der Anteil der Leute, die die Seite direkt nach dem Öffnen ohne jede Interaktion wieder verlassen. Eine hohe Absprungrate bedeutet, dass die Seite entweder ein Content- oder ein Ladezeit-Problem hat.' },
    ],
    fr: [
      { q: 'À partir de quand un CTR est-il élevé ?', a: 'Cela varie selon le secteur et la plateforme. Pour un lien en bio Instagram, 2 à 5 % c\'est bien et 10 %+ excellent. Dans les newsletters e-mail, 3 à 8 % est typique.' },
      { q: 'Qu\'est-ce qui compte le plus, les visiteurs uniques ou les clics totaux ?', a: 'À court terme, les clics totaux montrent la portée (notoriété de marque), tandis que les visiteurs uniques sont la vraie mesure de la portée. À long terme, il faut suivre les deux ensemble.' },
      { q: 'Que signifie le taux de rebond ?', a: 'La proportion de personnes qui repartent juste après avoir ouvert la page, sans aucune interaction. Un taux de rebond élevé signifie que la page a soit un problème de contenu, soit un problème de vitesse de chargement.' },
    ],
    pt: [
      { q: 'O que conta como um CTR alto?', a: 'Varia por setor e plataforma. Para um link na bio do Instagram, 2-5% é bom e 10%+ é excelente. Em newsletters de e-mail, 3-8% é o típico.' },
      { q: 'O que importa mais, visitantes únicos ou cliques totais?', a: 'No curto prazo, os cliques totais mostram alcance (reconhecimento de marca), enquanto os visitantes únicos são a medida real do alcance. No longo prazo você precisa acompanhar os dois juntos.' },
      { q: 'O que significa taxa de rejeição?', a: 'A proporção de pessoas que saem logo depois de abrir a página, sem nenhuma interação. Uma taxa de rejeição alta significa que a página tem um problema de conteúdo ou de velocidade de carregamento.' },
    ],
    it: [
      { q: 'Quando un CTR si considera alto?', a: 'Dipende dal settore e dalla piattaforma. Per un link nella bio di Instagram, il 2-5% è buono e il 10%+ è eccellente. Nelle newsletter via e-mail, il 3-8% è tipico.' },
      { q: 'Conta di più i visitatori unici o i clic totali?', a: 'Nel breve termine i clic totali mostrano la portata (notorietà del brand), mentre i visitatori unici sono la misura reale della portata. Nel lungo termine devi monitorarli entrambi insieme.' },
      { q: 'Cosa significa frequenza di rimbalzo?', a: 'La quota di persone che escono subito dopo aver aperto la pagina, senza alcuna interazione. Una frequenza di rimbalzo alta significa che la pagina ha un problema di contenuto o di velocità di caricamento.' },
    ],
    ja: [
      { q: 'CTRはどのくらいで高いといえますか？', a: '業種やプラットフォームによって変わります。Instagramのプロフィールリンクなら2〜5%で良好、10%以上なら非常に優秀です。メールのニュースレターでは3〜8%が一般的です。' },
      { q: 'ユニークビジターと総クリック数、どちらが重要ですか？', a: '短期的には総クリック数がリーチ（ブランド認知）を示し、ユニークビジターは本当のリーチの尺度になります。長期的には両方を合わせて追う必要があります。' },
      { q: '直帰率とは何ですか？', a: 'ページを開いた直後に、何の操作もせず離れてしまう人の割合です。直帰率が高いのは、そのページにコンテンツか読み込み速度のどちらかの問題があるということです。' },
    ],
  },
};

function PostTr() {
  return (
    <>
      <P>
        "Bu ay 5.000 tıklama aldım!" dediğinde herkes etkilenir ama <strong>ne anlama geldiğini biliyor musun?</strong>{' '}
        Bu rehberde link analitiğindeki 8 anahtar metriği ve gerçek dünyada ne anlattıklarını anlattık.
      </P>

      <H2>1. Toplam Tıklama (Total Clicks)</H2>
      <P>
        Basit ama yanıltıcı olabilir. Aynı kişi 5 kez tıklayıp döndü mü, yoksa 5 farklı kişi mi geldi?
        <strong> Tek başına iyi bir gösterge değil</strong>.
      </P>

      <H2>2. Tekil Ziyaretçi (Unique Visitors)</H2>
      <P>
        Sayfaya gelen benzersiz kişi sayısı. Anti-fraud dedup ile aynı kişi aynı gün tekrar sayılmaz. Bu, gerçek
        <strong> erişim ölçüsü</strong>. Toplam tıklama / tekil ziyaretçi oranı ne kadar yüksekse, ziyaretçilerin
        seninle etkileşimi o kadar derin.
      </P>

      <H2>3. Tıklama Oranı (CTR — Click-Through Rate)</H2>
      <P>
        <code className="rounded bg-surface px-1.5 py-0.5 text-sm text-brand-violet">CTR = (Tıklama / Görüntülenme) × 100</code>
      </P>
      <P>
        Sayfanı 1000 kişi gördü, 30 kişi bir link'e tıkladı → CTR %3. Yüksek CTR link'lerin ilgi çektiğini ve
        yerleşiminin doğru olduğunu gösterir.
      </P>

      <H2>4. Referrer (Nereden Geldi?)</H2>
      <P>
        Ziyaretçinin sayfana gelmeden önce hangi kaynakta olduğu. Instagram mı, Google mı, doğrudan URL mi?
      </P>
      <UL>
        <li><strong>Instagram / TikTok:</strong> Sosyal medyandan geldi — bio linki çalışıyor</li>
        <li><strong>Google:</strong> Organik arama — SEO iyi</li>
        <li><strong>Direct:</strong> URL'i biliyor (ağızdan ağıza ya da yer imi)</li>
        <li><strong>Bilinmiyor:</strong> Uygulama içi tıklama (SMS, WhatsApp, e-posta)</li>
      </UL>

      <H2>5. Cihaz Kırılımı</H2>
      <P>
        Mobil / masaüstü / tablet oranı. Instagram bio linki tıklayanların <strong>%95'i mobildir</strong>.
        Bu yüzden sayfan öncelikle mobil için optimize olmalı.
      </P>

      <InlineCta
        title="BeyLink analytics'i keşfet"
        desc="Tekil ziyaretçi, CTR, cihaz, ülke, referrer — hepsi tek panelde. Ücretsiz planda temel, Basic+ planda kırılımlar."
        href="/pricing"
        label="Paketleri Gör →"
      />

      <H2>6. Ülke Kırılımı</H2>
      <P>
        Ziyaretçin nereden geliyor? Türkçe içerik üretiyorsan ve %70 Türkiye'den gelmesi bekleniyor. Eğer %40 yurt dışıysa
        bir şey doğru gitmiyor (spam bot ya da yanlış hedef kitle) demektir.
      </P>

      <H2>7. Zaman Serisi (Timeline)</H2>
      <P>
        Tıklama günün hangi saatinde pik yapıyor? Bu bilgi çok değerli:
      </P>
      <UL>
        <li>En yoğun saat = paylaşım için ideal zaman</li>
        <li>Ani düşüş = kampanyan bitmiş demektir</li>
        <li>Ani yükseliş = viral olduysa, bunu takip et</li>
      </UL>

      <H2>8. BTAG / UTM Analizi</H2>
      <P>
        Her paylaşımın için farklı bir BTAG oluştur (?btag=insta, ?btag=tiktok). Sonra karşılaştır: hangi kaynak
        gerçekten iyi trafik getirdi? Hangi kampanya boşuna zaman kaybıydı? Bu veri olmadan reklam bütçen
        kaybolur.
      </P>

      <H2>Metrikleri birlikte oku</H2>
      <P>
        Tek başına hiçbir metrik anlamlı değil. Örnek:
      </P>
      <UL>
        <li>Yüksek tıklama + düşük CTR = trafik var ama link'ler ilgi çekmiyor → link başlıklarını değiştir</li>
        <li>Düşük tıklama + yüksek CTR = az kişi geliyor ama gelenler çok ilgili → daha fazla trafik çekmeye odaklan</li>
        <li>Yüksek tekil ziyaretçi + düşük dönüşüm = kitle geniş ama satın alma yok → hedef kitle uyumsuz</li>
      </UL>

      <Callout tone="info" title="Anti-fraud dedup nedir?">
        Aynı ziyaretçinin aynı gün tekrar tıklamalarını sayan platformlar rakamları şişirir. BeyLink first-party
        cookie ve visitor kimliği ile <strong>gerçek benzersiz sayım</strong> yapar. Yanıltıcı büyük rakamlar yerine
        anlamlı veriler.
      </Callout>

      <H2>Sonuç</H2>
      <P>
        Analitik olmadan pazarlama karanlıkta atış. Yukarıdaki 8 metriği haftalık takip et. Anlamadıklarını sorgula,
        anladıklarını iyileştir. 6 ay sonra kararların bilime dayalı olur — sezgiyle değil.
      </P>
      <P>
        <A href="/register">BeyLink ile başla</A>, ilk BTAG'ini oluştur, ilk kampanya raporunu al.
      </P>
    </>
  );
}

function PostEn() {
  return (
    <>
      <P>
        Everyone's impressed when you say "I got 5,000 clicks this month!" But <strong>do you know what it
        means?</strong>{' '}
        In this guide we cover the 8 key metrics in link analytics and what they actually tell you in the real world.
      </P>

      <H2>1. Total Clicks</H2>
      <P>
        Simple, but it can be misleading. Did the same person click 5 times, or did 5 different people show up?
        <strong> On its own, it's not a good indicator</strong>.
      </P>

      <H2>2. Unique Visitors</H2>
      <P>
        The number of distinct people who reached your page. With anti-fraud dedup, the same person isn't counted again
        the same day. This is the true
        <strong> measure of reach</strong>. The higher your total clicks / unique visitors ratio, the deeper your
        visitors' engagement with you.
      </P>

      <H2>3. Click-Through Rate (CTR)</H2>
      <P>
        <code className="rounded bg-surface px-1.5 py-0.5 text-sm text-brand-violet">CTR = (Clicks / Views) × 100</code>
      </P>
      <P>
        1,000 people saw your page and 30 clicked a link → CTR of 3%. A high CTR shows your links are catching interest
        and are well placed.
      </P>

      <H2>4. Referrer (Where Did They Come From?)</H2>
      <P>
        The source a visitor was on before reaching your page. Instagram, Google, or a direct URL?
      </P>
      <UL>
        <li><strong>Instagram / TikTok:</strong> Came from social media, so your bio link is working</li>
        <li><strong>Google:</strong> Organic search, which means your SEO is doing its job</li>
        <li><strong>Direct:</strong> They know the URL (word of mouth or a bookmark)</li>
        <li><strong>Unknown:</strong> In-app click (SMS, WhatsApp, email)</li>
      </UL>

      <H2>5. Device Breakdown</H2>
      <P>
        The mobile / desktop / tablet split. <strong>95% of people</strong> who click an Instagram bio link are on
        mobile. That's why your page should be optimized for mobile first.
      </P>

      <InlineCta
        title="Explore BeyLink analytics"
        desc="Unique visitors, CTR, device, country, referrer, all in one panel. Basics on the free plan, breakdowns on Basic+."
        href="/pricing"
        label="See Plans →"
      />

      <H2>6. Country Breakdown</H2>
      <P>
        Where are your visitors coming from? If you produce Turkish content, you'd expect 70% to come from Turkey. If
        40% is from abroad, something is off (spam bots or the wrong target audience).
      </P>

      <H2>7. Timeline</H2>
      <P>
        At what time of day do clicks peak? This is highly valuable:
      </P>
      <UL>
        <li>Your busiest hour = the ideal time to post</li>
        <li>A sudden drop = your campaign has ended</li>
        <li>A sudden spike = if it went viral, track it</li>
      </UL>

      <H2>8. BTAG / UTM Analysis</H2>
      <P>
        Create a different BTAG for each of your posts (?btag=insta, ?btag=tiktok). Then compare: which source really
        brought good traffic? Which campaign was a waste of time? Without this data, your ad budget just disappears.
      </P>

      <H2>Read the metrics together</H2>
      <P>
        No single metric is meaningful on its own. For example:
      </P>
      <UL>
        <li>High clicks + low CTR = you have traffic but the links aren't catching interest → change your link titles</li>
        <li>Low clicks + high CTR = few people come but those who do are very engaged → focus on driving more traffic</li>
        <li>High unique visitors + low conversion = broad audience but no purchases → audience mismatch</li>
      </UL>

      <Callout tone="info" title="What is anti-fraud dedup?">
        Platforms that count a visitor's repeat clicks on the same day inflate the numbers. BeyLink uses a first-party
        cookie and a visitor identity to produce a <strong>true unique count</strong>. Meaningful data instead of
        misleadingly big numbers.
      </Callout>

      <H2>Conclusion</H2>
      <P>
        Marketing without analytics is shooting in the dark. Track the 8 metrics above weekly. Question what you don't
        understand, improve what you do. After 6 months your decisions rest on science, not intuition.
      </P>
      <P>
        <A href="/register">Get started with BeyLink</A>, create your first BTAG, and pull your first campaign report.
      </P>
    </>
  );
}

function PostRu() {
  return (
    <>
      <P>
        Все впечатляются, когда вы говорите «В этом месяце я получил 5000 кликов!». Но <strong>знаете ли вы, что это
        значит?</strong>{' '}
        В этом руководстве мы разберём 8 ключевых метрик аналитики ссылок и что они на самом деле говорят в реальном мире.
      </P>

      <H2>1. Всего кликов (Total Clicks)</H2>
      <P>
        Просто, но может вводить в заблуждение. Один и тот же человек кликнул 5 раз или пришло 5 разных людей?
        <strong> Сама по себе это не лучший показатель</strong>.
      </P>

      <H2>2. Уникальные посетители (Unique Visitors)</H2>
      <P>
        Число различных людей, попавших на вашу страницу. С защитой от накрутки (дедупликацией) один и тот же человек не
        учитывается повторно в тот же день. Это истинная
        <strong> мера охвата</strong>. Чем выше соотношение всего кликов / уникальных посетителей, тем глубже
        вовлечённость ваших посетителей.
      </P>

      <H2>3. Кликабельность (CTR)</H2>
      <P>
        <code className="rounded bg-surface px-1.5 py-0.5 text-sm text-brand-violet">CTR = (Клики / Просмотры) × 100</code>
      </P>
      <P>
        Вашу страницу увидели 1000 человек, и 30 кликнули по ссылке → CTR 3%. Высокий CTR показывает, что ваши ссылки
        цепляют интерес и хорошо расположены.
      </P>

      <H2>4. Реферер (Откуда они пришли?)</H2>
      <P>
        Источник, на котором был посетитель до того, как попал на вашу страницу. Instagram, Google или прямой URL?
      </P>
      <UL>
        <li><strong>Instagram / TikTok:</strong> пришёл из соцсетей, значит ваша ссылка в био работает</li>
        <li><strong>Google:</strong> органический поиск, значит ваше SEO делает своё дело</li>
        <li><strong>Прямой заход:</strong> они знают URL (сарафанное радио или закладка)</li>
        <li><strong>Неизвестно:</strong> клик внутри приложения (SMS, WhatsApp, почта)</li>
      </UL>

      <H2>5. Разбивка по устройствам</H2>
      <P>
        Соотношение мобильные / десктоп / планшет. <strong>95% людей</strong>, которые кликают по ссылке в Instagram-био,
        сидят с мобильного. Именно поэтому ваша страница должна быть оптимизирована в первую очередь под мобильные.
      </P>

      <InlineCta
        title="Изучите аналитику BeyLink"
        desc="Уникальные посетители, CTR, устройство, страна, реферер, всё в одной панели. Базовое на бесплатном плане, разбивки на Basic+."
        href="/pricing"
        label="Смотреть тарифы →"
      />

      <H2>6. Разбивка по странам</H2>
      <P>
        Откуда приходят ваши посетители? Если вы создаёте контент на определённом языке, вы ожидаете, что большинство
        придёт из соответствующего региона. Если заметная доля идёт из неожиданных мест, что-то не так (спам-боты или
        неверная целевая аудитория).
      </P>

      <H2>7. Временной ряд (Timeline)</H2>
      <P>
        В какое время суток клики достигают пика? Это очень ценно:
      </P>
      <UL>
        <li>Ваш самый активный час = идеальное время для публикации</li>
        <li>Резкое падение = ваша кампания завершилась</li>
        <li>Резкий всплеск = если стало вирусным, отслеживайте это</li>
      </UL>

      <H2>8. Анализ BTAG / UTM</H2>
      <P>
        Создайте отдельный BTAG для каждой из ваших публикаций (?btag=insta, ?btag=tiktok). Затем сравните: какой источник
        действительно принёс хороший трафик? Какая кампания была пустой тратой времени? Без этих данных ваш рекламный
        бюджет просто исчезает.
      </P>

      <H2>Читайте метрики вместе</H2>
      <P>
        Ни одна метрика сама по себе не имеет смысла. Например:
      </P>
      <UL>
        <li>Много кликов + низкий CTR = трафик есть, но ссылки не цепляют интерес → поменяйте заголовки ссылок</li>
        <li>Мало кликов + высокий CTR = приходит немного людей, но они очень вовлечены → сосредоточьтесь на привлечении трафика</li>
        <li>Много уникальных посетителей + низкая конверсия = широкая аудитория, но нет покупок → несовпадение аудитории</li>
      </UL>

      <Callout tone="info" title="Что такое защита от накрутки (дедупликация)?">
        Платформы, которые считают повторные клики посетителя в тот же день, раздувают цифры. BeyLink использует
        first-party cookie и идентификатор посетителя, чтобы получить <strong>истинный уникальный подсчёт</strong>.
        Осмысленные данные вместо обманчиво больших чисел.
      </Callout>

      <H2>Заключение</H2>
      <P>
        Маркетинг без аналитики это стрельба вслепую. Отслеживайте 8 метрик выше еженедельно. Задавайтесь вопросами о том,
        чего не понимаете, улучшайте то, что понимаете. Через 6 месяцев ваши решения будут опираться на науку, а не на
        интуицию.
      </P>
      <P>
        <A href="/register">Начните с BeyLink</A>, создайте свой первый BTAG и получите первый отчёт по кампании.
      </P>
    </>
  );
}

function PostEs() {
  return (
    <>
      <P>
        Todo el mundo se queda impresionado cuando dices "¡Este mes he conseguido 5.000 clics!". Pero <strong>¿sabes lo
        que significa?</strong>{' '}
        En esta guía cubrimos las 8 métricas clave de la analítica de enlaces y lo que de verdad te dicen en el mundo real.
      </P>

      <H2>1. Clics totales (Total Clicks)</H2>
      <P>
        Sencillo, pero puede engañar. ¿La misma persona hizo clic 5 veces, o aparecieron 5 personas distintas?
        <strong> Por sí solo no es un buen indicador</strong>.
      </P>

      <H2>2. Visitantes únicos (Unique Visitors)</H2>
      <P>
        El número de personas distintas que llegaron a tu página. Con la deduplicación antifraude, la misma persona no se
        cuenta otra vez el mismo día. Esta es la verdadera
        <strong> medida del alcance</strong>. Cuanto mayor sea tu proporción de clics totales / visitantes únicos, más
        profunda es la interacción de tus visitantes contigo.
      </P>

      <H2>3. Tasa de clics (CTR)</H2>
      <P>
        <code className="rounded bg-surface px-1.5 py-0.5 text-sm text-brand-violet">CTR = (Clics / Vistas) × 100</code>
      </P>
      <P>
        1.000 personas vieron tu página y 30 hicieron clic en un enlace → un CTR del 3%. Un CTR alto muestra que tus
        enlaces captan interés y están bien colocados.
      </P>

      <H2>4. Referente (¿De dónde vinieron?)</H2>
      <P>
        La fuente en la que estaba un visitante antes de llegar a tu página. ¿Instagram, Google o una URL directa?
      </P>
      <UL>
        <li><strong>Instagram / TikTok:</strong> vino de redes sociales, así que tu enlace en la bio funciona</li>
        <li><strong>Google:</strong> búsqueda orgánica, lo que significa que tu SEO cumple su función</li>
        <li><strong>Directo:</strong> conocen la URL (boca a boca o un marcador)</li>
        <li><strong>Desconocido:</strong> clic dentro de una app (SMS, WhatsApp, correo)</li>
      </UL>

      <H2>5. Desglose por dispositivo</H2>
      <P>
        El reparto entre móvil / escritorio / tableta. El <strong>95% de las personas</strong> que hacen clic en un
        enlace de la bio de Instagram están en el móvil. Por eso tu página debería estar optimizada primero para móvil.
      </P>

      <InlineCta
        title="Explora la analítica de BeyLink"
        desc="Visitantes únicos, CTR, dispositivo, país, referente, todo en un panel. Lo básico en el plan gratis, los desgloses en Basic+."
        href="/pricing"
        label="Ver planes →"
      />

      <H2>6. Desglose por país</H2>
      <P>
        ¿De dónde vienen tus visitantes? Si creas contenido en un idioma concreto, esperas que la mayoría llegue de la
        región correspondiente. Si una parte notable viene de sitios inesperados, algo no va bien (bots de spam o el
        público objetivo equivocado).
      </P>

      <H2>7. Serie temporal (Timeline)</H2>
      <P>
        ¿A qué hora del día alcanzan su pico los clics? Esto es muy valioso:
      </P>
      <UL>
        <li>Tu hora de más actividad = el momento ideal para publicar</li>
        <li>Una caída repentina = tu campaña ha terminado</li>
        <li>Un pico repentino = si se hizo viral, síguelo de cerca</li>
      </UL>

      <H2>8. Análisis de BTAG / UTM</H2>
      <P>
        Crea un BTAG distinto para cada una de tus publicaciones (?btag=insta, ?btag=tiktok). Luego compara: ¿qué fuente
        trajo realmente buen tráfico? ¿Qué campaña fue una pérdida de tiempo? Sin estos datos, tu presupuesto de
        publicidad simplemente desaparece.
      </P>

      <H2>Lee las métricas en conjunto</H2>
      <P>
        Ninguna métrica tiene sentido por sí sola. Por ejemplo:
      </P>
      <UL>
        <li>Muchos clics + CTR bajo = tienes tráfico pero los enlaces no captan interés → cambia los títulos de tus enlaces</li>
        <li>Pocos clics + CTR alto = viene poca gente pero la que viene está muy interesada → céntrate en atraer más tráfico</li>
        <li>Muchos visitantes únicos + conversión baja = audiencia amplia pero sin compras → desajuste de audiencia</li>
      </UL>

      <Callout tone="info" title="¿Qué es la deduplicación antifraude?">
        Las plataformas que cuentan los clics repetidos de un visitante el mismo día inflan las cifras. BeyLink usa una
        cookie de origen y una identidad de visitante para producir un <strong>recuento único real</strong>. Datos con
        sentido en lugar de cifras grandes y engañosas.
      </Callout>

      <H2>Conclusión</H2>
      <P>
        El marketing sin analítica es disparar a ciegas. Sigue las 8 métricas de arriba cada semana. Cuestiona lo que no
        entiendas, mejora lo que sí. Al cabo de 6 meses tus decisiones se apoyan en la ciencia, no en la intuición.
      </P>
      <P>
        <A href="/register">Empieza con BeyLink</A>, crea tu primer BTAG y saca tu primer informe de campaña.
      </P>
    </>
  );
}

function PostDe() {
  return (
    <>
      <P>
        Alle sind beeindruckt, wenn du sagst: „Diesen Monat hatte ich 5.000 Klicks!“ Aber <strong>weißt du, was das
        bedeutet?</strong>{' '}
        In diesem Guide behandeln wir die 8 wichtigsten Metriken der Link-Analyse und was sie dir in der realen Welt
        tatsächlich sagen.
      </P>

      <H2>1. Gesamtklicks (Total Clicks)</H2>
      <P>
        Einfach, aber es kann irreführend sein. Hat dieselbe Person 5-mal geklickt, oder sind 5 verschiedene Leute
        aufgetaucht?
        <strong> Für sich allein ist das kein guter Indikator</strong>.
      </P>

      <H2>2. Unique Visitors</H2>
      <P>
        Die Zahl der einzelnen Personen, die deine Seite erreicht haben. Mit Anti-Fraud-Dedup wird dieselbe Person am
        selben Tag nicht erneut gezählt. Das ist das echte
        <strong> Maß für Reichweite</strong>. Je höher dein Verhältnis von Gesamtklicks zu Unique Visitors, desto tiefer
        die Interaktion deiner Besucher mit dir.
      </P>

      <H2>3. Klickrate (CTR)</H2>
      <P>
        <code className="rounded bg-surface px-1.5 py-0.5 text-sm text-brand-violet">CTR = (Klicks / Aufrufe) × 100</code>
      </P>
      <P>
        1.000 Leute haben deine Seite gesehen und 30 haben einen Link geklickt → eine CTR von 3 %. Eine hohe CTR zeigt,
        dass deine Links Interesse wecken und gut platziert sind.
      </P>

      <H2>4. Referrer (Woher kamen sie?)</H2>
      <P>
        Die Quelle, auf der ein Besucher war, bevor er deine Seite erreichte. Instagram, Google oder eine direkte URL?
      </P>
      <UL>
        <li><strong>Instagram / TikTok:</strong> Kam aus Social Media, also funktioniert dein Bio-Link</li>
        <li><strong>Google:</strong> Organische Suche, was bedeutet, dass dein SEO seine Arbeit macht</li>
        <li><strong>Direkt:</strong> Sie kennen die URL (Mundpropaganda oder ein Lesezeichen)</li>
        <li><strong>Unbekannt:</strong> In-App-Klick (SMS, WhatsApp, E-Mail)</li>
      </UL>

      <H2>5. Geräte-Aufschlüsselung</H2>
      <P>
        Die Aufteilung nach Mobil / Desktop / Tablet. <strong>95 % der Leute</strong>, die einen Instagram-Bio-Link
        klicken, sind mobil unterwegs. Deshalb sollte deine Seite zuerst für Mobil optimiert sein.
      </P>

      <InlineCta
        title="Entdecke die BeyLink-Analyse"
        desc="Unique Visitors, CTR, Gerät, Land, Referrer, alles in einem Panel. Grundlagen im Free-Tarif, Aufschlüsselungen ab Basic+."
        href="/pricing"
        label="Tarife ansehen →"
      />

      <H2>6. Länder-Aufschlüsselung</H2>
      <P>
        Woher kommen deine Besucher? Wenn du Content in einer bestimmten Sprache produzierst, erwartest du, dass die
        Mehrheit aus der passenden Region kommt. Kommt ein nennenswerter Anteil aus unerwarteten Orten, stimmt etwas
        nicht (Spam-Bots oder die falsche Zielgruppe).
      </P>

      <H2>7. Zeitreihe (Timeline)</H2>
      <P>
        Zu welcher Tageszeit erreichen die Klicks ihren Höhepunkt? Das ist sehr wertvoll:
      </P>
      <UL>
        <li>Deine aktivste Stunde = der ideale Zeitpunkt zum Posten</li>
        <li>Ein plötzlicher Einbruch = deine Kampagne ist beendet</li>
        <li>Ein plötzlicher Anstieg = wenn es viral ging, verfolge es</li>
      </UL>

      <H2>8. BTAG- / UTM-Analyse</H2>
      <P>
        Erstelle für jeden deiner Posts ein anderes BTAG (?btag=insta, ?btag=tiktok). Vergleiche dann: Welche Quelle hat
        wirklich guten Traffic gebracht? Welche Kampagne war Zeitverschwendung? Ohne diese Daten verschwindet dein
        Werbebudget einfach.
      </P>

      <H2>Lies die Metriken zusammen</H2>
      <P>
        Keine einzelne Metrik ist für sich allein aussagekräftig. Zum Beispiel:
      </P>
      <UL>
        <li>Viele Klicks + niedrige CTR = du hast Traffic, aber die Links wecken kein Interesse → ändere deine Link-Titel</li>
        <li>Wenige Klicks + hohe CTR = es kommen wenige Leute, aber die sind sehr engagiert → konzentriere dich darauf, mehr Traffic zu bringen</li>
        <li>Viele Unique Visitors + niedrige Conversion = breites Publikum, aber keine Käufe → Zielgruppen-Fehlpassung</li>
      </UL>

      <Callout tone="info" title="Was ist Anti-Fraud-Dedup?">
        Plattformen, die die wiederholten Klicks eines Besuchers am selben Tag zählen, blähen die Zahlen auf. BeyLink
        nutzt einen First-Party-Cookie und eine Besucher-Identität, um eine <strong>echte Unique-Zählung</strong> zu
        liefern. Aussagekräftige Daten statt irreführend großer Zahlen.
      </Callout>

      <H2>Fazit</H2>
      <P>
        Marketing ohne Analyse ist ein Schuss ins Dunkle. Verfolge die 8 Metriken oben wöchentlich. Hinterfrage, was du
        nicht verstehst, verbessere, was du verstehst. Nach 6 Monaten ruhen deine Entscheidungen auf Wissenschaft, nicht
        auf Intuition.
      </P>
      <P>
        <A href="/register">Leg mit BeyLink los</A>, erstelle dein erstes BTAG und zieh deinen ersten Kampagnenbericht.
      </P>
    </>
  );
}

function PostFr() {
  return (
    <>
      <P>
        Tout le monde est impressionné quand vous dites « J'ai eu 5000 clics ce mois-ci ! ». Mais <strong>savez-vous ce
        que ça veut dire ?</strong>{' '}
        Dans ce guide, nous couvrons les 8 métriques clés de l'analyse de liens et ce qu'elles vous disent réellement
        dans le monde réel.
      </P>

      <H2>1. Clics totaux (Total Clicks)</H2>
      <P>
        Simple, mais cela peut induire en erreur. La même personne a-t-elle cliqué 5 fois, ou 5 personnes différentes
        sont-elles venues ?
        <strong> À lui seul, ce n'est pas un bon indicateur</strong>.
      </P>

      <H2>2. Visiteurs uniques (Unique Visitors)</H2>
      <P>
        Le nombre de personnes distinctes qui ont atteint votre page. Avec la déduplication anti-fraude, la même personne
        n'est pas comptée deux fois le même jour. C'est la vraie
        <strong> mesure de la portée</strong>. Plus votre rapport clics totaux / visiteurs uniques est élevé, plus
        l'engagement de vos visiteurs avec vous est profond.
      </P>

      <H2>3. Taux de clics (CTR)</H2>
      <P>
        <code className="rounded bg-surface px-1.5 py-0.5 text-sm text-brand-violet">CTR = (Clics / Vues) × 100</code>
      </P>
      <P>
        1000 personnes ont vu votre page et 30 ont cliqué sur un lien → un CTR de 3 %. Un CTR élevé montre que vos liens
        captent l'intérêt et sont bien placés.
      </P>

      <H2>4. Référent (D'où venaient-ils ?)</H2>
      <P>
        La source sur laquelle un visiteur se trouvait avant d'atteindre votre page. Instagram, Google ou une URL directe ?
      </P>
      <UL>
        <li><strong>Instagram / TikTok :</strong> venu des réseaux sociaux, donc votre lien en bio fonctionne</li>
        <li><strong>Google :</strong> recherche organique, ce qui veut dire que votre SEO fait son travail</li>
        <li><strong>Direct :</strong> ils connaissent l'URL (bouche-à-oreille ou favori)</li>
        <li><strong>Inconnu :</strong> clic dans une application (SMS, WhatsApp, e-mail)</li>
      </UL>

      <H2>5. Répartition par appareil</H2>
      <P>
        La répartition mobile / ordinateur / tablette. <strong>95 % des personnes</strong> qui cliquent sur un lien en
        bio Instagram sont sur mobile. C'est pourquoi votre page doit être optimisée d'abord pour le mobile.
      </P>

      <InlineCta
        title="Explorez les statistiques BeyLink"
        desc="Visiteurs uniques, CTR, appareil, pays, référent, tout dans un seul panneau. Les bases sur le forfait gratuit, les détails à partir de Basic+."
        href="/pricing"
        label="Voir les forfaits →"
      />

      <H2>6. Répartition par pays</H2>
      <P>
        D'où viennent vos visiteurs ? Si vous produisez du contenu dans une langue précise, vous vous attendez à ce que
        la majorité vienne de la région correspondante. Si une part notable vient d'endroits inattendus, quelque chose
        cloche (bots de spam ou mauvaise audience cible).
      </P>

      <H2>7. Série temporelle (Timeline)</H2>
      <P>
        À quelle heure de la journée les clics atteignent-ils leur pic ? C'est très précieux :
      </P>
      <UL>
        <li>Votre heure la plus active = le moment idéal pour publier</li>
        <li>Une chute soudaine = votre campagne est terminée</li>
        <li>Un pic soudain = si c'est devenu viral, suivez-le de près</li>
      </UL>

      <H2>8. Analyse BTAG / UTM</H2>
      <P>
        Créez un BTAG différent pour chacune de vos publications (?btag=insta, ?btag=tiktok). Comparez ensuite : quelle
        source a vraiment apporté du bon trafic ? Quelle campagne a été une perte de temps ? Sans ces données, votre
        budget publicitaire disparaît tout simplement.
      </P>

      <H2>Lisez les métriques ensemble</H2>
      <P>
        Aucune métrique n'a de sens à elle seule. Par exemple :
      </P>
      <UL>
        <li>Beaucoup de clics + CTR faible = vous avez du trafic mais les liens ne captent pas l'intérêt → changez les titres de vos liens</li>
        <li>Peu de clics + CTR élevé = peu de gens viennent mais ceux qui viennent sont très engagés → concentrez-vous sur l'apport de trafic</li>
        <li>Beaucoup de visiteurs uniques + conversion faible = audience large mais pas d'achats → décalage d'audience</li>
      </UL>

      <Callout tone="info" title="Qu'est-ce que la déduplication anti-fraude ?">
        Les plateformes qui comptent les clics répétés d'un visiteur le même jour gonflent les chiffres. BeyLink utilise
        un cookie first-party et une identité de visiteur pour produire un <strong>vrai décompte unique</strong>. Des
        données pertinentes plutôt que des chiffres faussement gros.
      </Callout>

      <H2>Conclusion</H2>
      <P>
        Le marketing sans statistiques, c'est tirer dans le noir. Suivez les 8 métriques ci-dessus chaque semaine.
        Interrogez ce que vous ne comprenez pas, améliorez ce que vous comprenez. Au bout de 6 mois, vos décisions
        reposent sur la science, pas sur l'intuition.
      </P>
      <P>
        <A href="/register">Lancez-vous avec BeyLink</A>, créez votre premier BTAG et sortez votre premier rapport de
        campagne.
      </P>
    </>
  );
}

function PostPt() {
  return (
    <>
      <P>
        Todo mundo se impressiona quando você diz "Consegui 5.000 cliques neste mês!". Mas <strong>você sabe o que isso
        significa?</strong>{' '}
        Neste guia cobrimos as 8 métricas-chave da análise de links e o que elas realmente te dizem no mundo real.
      </P>

      <H2>1. Cliques totais (Total Clicks)</H2>
      <P>
        Simples, mas pode enganar. A mesma pessoa clicou 5 vezes ou apareceram 5 pessoas diferentes?
        <strong> Sozinha, não é um bom indicador</strong>.
      </P>

      <H2>2. Visitantes únicos (Unique Visitors)</H2>
      <P>
        O número de pessoas distintas que chegaram à sua página. Com a deduplicação antifraude, a mesma pessoa não é
        contada de novo no mesmo dia. Esta é a verdadeira
        <strong> medida de alcance</strong>. Quanto maior a sua razão cliques totais / visitantes únicos, mais profundo o
        engajamento dos seus visitantes com você.
      </P>

      <H2>3. Taxa de cliques (CTR)</H2>
      <P>
        <code className="rounded bg-surface px-1.5 py-0.5 text-sm text-brand-violet">CTR = (Cliques / Visualizações) × 100</code>
      </P>
      <P>
        1.000 pessoas viram a sua página e 30 clicaram em um link → CTR de 3%. Um CTR alto mostra que os seus links estão
        prendendo o interesse e estão bem posicionados.
      </P>

      <H2>4. Referenciador (De onde eles vieram?)</H2>
      <P>
        A origem em que o visitante estava antes de chegar à sua página. Instagram, Google ou uma URL direta?
      </P>
      <UL>
        <li><strong>Instagram / TikTok:</strong> veio das redes sociais, então o seu link na bio está funcionando</li>
        <li><strong>Google:</strong> busca orgânica, o que significa que o seu SEO está cumprindo o papel</li>
        <li><strong>Direto:</strong> eles conhecem a URL (boca a boca ou um favorito)</li>
        <li><strong>Desconhecido:</strong> clique dentro de um app (SMS, WhatsApp, e-mail)</li>
      </UL>

      <H2>5. Divisão por dispositivo</H2>
      <P>
        A divisão entre celular / desktop / tablet. <strong>95% das pessoas</strong> que clicam em um link na bio do
        Instagram estão no celular. É por isso que a sua página deve ser otimizada primeiro para o celular.
      </P>

      <InlineCta
        title="Explore a análise do BeyLink"
        desc="Visitantes únicos, CTR, dispositivo, país, referenciador, tudo em um painel. O básico no plano gratuito, as divisões no Básico+."
        href="/pricing"
        label="Ver planos →"
      />

      <H2>6. Divisão por país</H2>
      <P>
        De onde vêm os seus visitantes? Se você produz conteúdo em um idioma específico, você espera que a maioria venha
        da região correspondente. Se uma parcela considerável vem de lugares inesperados, algo está errado (bots de spam
        ou o público-alvo errado).
      </P>

      <H2>7. Série temporal (Timeline)</H2>
      <P>
        Em qual hora do dia os cliques atingem o pico? Isso é muito valioso:
      </P>
      <UL>
        <li>A sua hora mais movimentada = o momento ideal para postar</li>
        <li>Uma queda repentina = a sua campanha terminou</li>
        <li>Um pico repentino = se viralizou, acompanhe de perto</li>
      </UL>

      <H2>8. Análise de BTAG / UTM</H2>
      <P>
        Crie um BTAG diferente para cada uma das suas postagens (?btag=insta, ?btag=tiktok). Depois compare: qual origem
        realmente trouxe bom tráfego? Qual campanha foi perda de tempo? Sem esses dados, o seu orçamento de anúncios
        simplesmente desaparece.
      </P>

      <H2>Leia as métricas em conjunto</H2>
      <P>
        Nenhuma métrica sozinha faz sentido. Por exemplo:
      </P>
      <UL>
        <li>Muitos cliques + CTR baixo = você tem tráfego, mas os links não prendem o interesse → mude os títulos dos seus links</li>
        <li>Poucos cliques + CTR alto = vem pouca gente, mas quem vem é muito engajado → foque em trazer mais tráfego</li>
        <li>Muitos visitantes únicos + conversão baixa = audiência ampla, mas sem compras → desalinhamento de audiência</li>
      </UL>

      <Callout tone="info" title="O que é deduplicação antifraude?">
        Plataformas que contam os cliques repetidos de um visitante no mesmo dia inflam os números. O BeyLink usa um
        cookie de origem e uma identidade de visitante para produzir uma <strong>contagem única de verdade</strong>.
        Dados com sentido em vez de números grandes e enganosos.
      </Callout>

      <H2>Conclusão</H2>
      <P>
        Marketing sem análise é atirar no escuro. Acompanhe as 8 métricas acima toda semana. Questione o que você não
        entende, melhore o que você entende. Depois de 6 meses, as suas decisões se apoiam na ciência, não na intuição.
      </P>
      <P>
        <A href="/register">Comece com o BeyLink</A>, crie o seu primeiro BTAG e gere o seu primeiro relatório de campanha.
      </P>
    </>
  );
}

function PostIt() {
  return (
    <>
      <P>
        Quando dici "questo mese ho fatto 5.000 clic!" restano tutti colpiti. Ma <strong>sai cosa significa
        davvero?</strong>{' '}
        In questa guida vediamo le 8 metriche chiave dell'analisi dei link e cosa ti raccontano davvero nel mondo reale.
      </P>

      <H2>1. Clic totali (Total Clicks)</H2>
      <P>
        Semplice, ma può ingannare. La stessa persona ha cliccato 5 volte o sono arrivate 5 persone diverse?
        <strong> Da sola non è una buona metrica</strong>.
      </P>

      <H2>2. Visitatori unici (Unique Visitors)</H2>
      <P>
        Il numero di persone distinte che hanno raggiunto la tua pagina. Con la deduplicazione anti-frode, la stessa
        persona non viene conteggiata di nuovo nello stesso giorno. Questa è la vera
        <strong> misura della portata</strong>. Più alto è il rapporto clic totali / visitatori unici, più profondo è
        il coinvolgimento dei tuoi visitatori.
      </P>

      <H2>3. Tasso di clic (CTR)</H2>
      <P>
        <code className="rounded bg-surface px-1.5 py-0.5 text-sm text-brand-violet">CTR = (Clic / Visualizzazioni) × 100</code>
      </P>
      <P>
        La tua pagina è stata vista da 1.000 persone e 30 hanno cliccato un link → CTR del 3%. Un CTR alto indica che i
        tuoi link attirano interesse e sono ben posizionati.
      </P>

      <H2>4. Referrer (da dove sono arrivati?)</H2>
      <P>
        La fonte su cui si trovava il visitatore prima di raggiungere la tua pagina. Instagram, Google o un URL diretto?
      </P>
      <UL>
        <li><strong>Instagram / TikTok:</strong> arriva dai social, quindi il tuo link in bio funziona</li>
        <li><strong>Google:</strong> ricerca organica, quindi la tua SEO sta facendo il suo lavoro</li>
        <li><strong>Diretto:</strong> conosce l'URL (passaparola o segnalibro)</li>
        <li><strong>Sconosciuto:</strong> clic in-app (SMS, WhatsApp, e-mail)</li>
      </UL>

      <H2>5. Ripartizione per dispositivo</H2>
      <P>
        La suddivisione mobile / desktop / tablet. Il <strong>95% delle persone</strong> che clicca un link nella bio di
        Instagram è da mobile. Ecco perché la tua pagina deve essere ottimizzata prima di tutto per il mobile.
      </P>

      <InlineCta
        title="Scopri le statistiche di BeyLink"
        desc="Visitatori unici, CTR, dispositivo, paese, referrer, tutto in un unico pannello. Le basi nel piano gratuito, le ripartizioni dal piano Base in su."
        href="/pricing"
        label="Vedi i piani →"
      />

      <H2>6. Ripartizione per paese</H2>
      <P>
        Da dove arrivano i tuoi visitatori? Se produci contenuti in una lingua specifica, ti aspetti che la maggior
        parte arrivi dalla regione corrispondente. Se una quota consistente proviene da luoghi inattesi, qualcosa non va
        (bot di spam o il pubblico sbagliato).
      </P>

      <H2>7. Serie temporale (Timeline)</H2>
      <P>
        In quale ora del giorno i clic raggiungono il picco? È un dato molto prezioso:
      </P>
      <UL>
        <li>L'ora di punta = il momento ideale per pubblicare</li>
        <li>Un calo improvviso = la tua campagna è finita</li>
        <li>Un picco improvviso = se è diventato virale, seguilo da vicino</li>
      </UL>

      <H2>8. Analisi BTAG / UTM</H2>
      <P>
        Crea un BTAG diverso per ciascuno dei tuoi post (?btag=insta, ?btag=tiktok). Poi confronta: quale fonte ha
        portato davvero traffico buono? Quale campagna è stata una perdita di tempo? Senza questi dati, il tuo budget
        pubblicitario svanisce.
      </P>

      <H2>Leggi le metriche insieme</H2>
      <P>
        Nessuna metrica ha senso da sola. Per esempio:
      </P>
      <UL>
        <li>Clic alti + CTR basso = hai traffico ma i link non attirano interesse → cambia i titoli dei link</li>
        <li>Clic bassi + CTR alto = arrivano poche persone ma sono molto coinvolte → concentrati sul portare più traffico</li>
        <li>Molti visitatori unici + poche conversioni = pubblico ampio ma nessun acquisto → pubblico non in target</li>
      </UL>

      <Callout tone="info" title="Cos'è la deduplicazione anti-frode?">
        Le piattaforme che contano i clic ripetuti di un visitatore nello stesso giorno gonfiano i numeri. BeyLink usa un
        cookie first-party e un'identità del visitatore per produrre un <strong>conteggio unico reale</strong>. Dati
        significativi al posto di numeri grandi e ingannevoli.
      </Callout>

      <H2>Conclusione</H2>
      <P>
        Fare marketing senza statistiche è come sparare al buio. Monitora ogni settimana le 8 metriche qui sopra. Metti
        in discussione ciò che non capisci, migliora ciò che capisci. Dopo 6 mesi le tue decisioni si basano sulla
        scienza, non sull'intuito.
      </P>
      <P>
        <A href="/register">Inizia con BeyLink</A>, crea il tuo primo BTAG e scarica il tuo primo report di campagna.
      </P>
    </>
  );
}

function PostJa() {
  return (
    <>
      <P>
        「今月5,000クリックあった！」と言えば、みんな感心します。でも、<strong>それが何を意味するか、あなたはわかっていますか？</strong>{' '}
        このガイドでは、リンク分析における8つの重要な指標と、それが現実に何を教えてくれるのかを解説します。
      </P>

      <H2>1. 総クリック数</H2>
      <P>
        シンプルですが、誤解を招くこともあります。同じ人が5回クリックしたのか、それとも別々の5人が来たのか。
        <strong>これ単体では、良い指標とはいえません</strong>。
      </P>

      <H2>2. ユニークビジター</H2>
      <P>
        あなたのページに到達した、重複を除いた人数です。不正防止の重複除外により、同じ人は同じ日に二重にカウントされません。これこそ本当の
        <strong>リーチの尺度</strong>です。総クリック数 ÷ ユニークビジターの比率が高いほど、訪問者のあなたへの関わりは深いといえます。
      </P>

      <H2>3. クリック率（CTR）</H2>
      <P>
        <code className="rounded bg-surface px-1.5 py-0.5 text-sm text-brand-violet">CTR =（クリック ÷ 表示）× 100</code>
      </P>
      <P>
        1,000人がページを見て30人がリンクをクリックした → CTRは3%。CTRが高いのは、リンクが興味を引き、うまく配置されている証拠です。
      </P>

      <H2>4. リファラー（どこから来たか？）</H2>
      <P>
        訪問者があなたのページに来る前にいた場所です。Instagramか、Googleか、それとも直接URLか。
      </P>
      <UL>
        <li><strong>Instagram / TikTok：</strong>SNSから来ている。つまりプロフィールリンクが機能している</li>
        <li><strong>Google：</strong>オーガニック検索。つまりSEOが役目を果たしている</li>
        <li><strong>直接：</strong>URLを知っている（口コミやブックマーク）</li>
        <li><strong>不明：</strong>アプリ内クリック（SMS、WhatsApp、メール）</li>
      </UL>

      <H2>5. デバイス別の内訳</H2>
      <P>
        モバイル / デスクトップ / タブレットの割合です。Instagramのプロフィールリンクをクリックする人の<strong>95%</strong>はモバイルです。
        だからこそ、あなたのページはモバイルファーストで最適化すべきなのです。
      </P>

      <InlineCta
        title="BeyLinkのアナリティクスを見る"
        desc="ユニークビジター、CTR、デバイス、国、リファラーを1つの画面で。基本は無料プラン、詳しい内訳はBasic以上で。"
        href="/pricing"
        label="プランを見る →"
      />

      <H2>6. 国別の内訳</H2>
      <P>
        訪問者はどこから来ているのか。特定の言語でコンテンツを作っているなら、多くがその地域から来ると考えられます。
        もし予想外の場所からの割合が目立つなら、何かがおかしいということです（スパムボットか、ターゲット層のズレ）。
      </P>

      <H2>7. タイムライン</H2>
      <P>
        一日のうち、どの時間帯にクリックがピークになるのか。これはとても価値のある情報です。
      </P>
      <UL>
        <li>いちばん多い時間 = 投稿に最適なタイミング</li>
        <li>急な落ち込み = キャンペーンが終わったサイン</li>
        <li>急な跳ね上がり = バズったなら、その要因を追う</li>
      </UL>

      <H2>8. BTAG / UTM 分析</H2>
      <P>
        投稿ごとに別々のBTAGを作りましょう（?btag=insta、?btag=tiktok）。そのうえで比較します。どの流入元が本当に良いトラフィックを連れてきたのか。
        どのキャンペーンが時間の無駄だったのか。このデータがなければ、広告予算はただ消えていくだけです。
      </P>

      <H2>指標は組み合わせて読む</H2>
      <P>
        どの指標も、単体では意味を持ちません。たとえば、
      </P>
      <UL>
        <li>クリック多い + CTR低い = トラフィックはあるがリンクが興味を引いていない → リンクのタイトルを変える</li>
        <li>クリック少ない + CTR高い = 来る人は少ないが、来た人はとても関心が高い → トラフィックを増やすことに集中する</li>
        <li>ユニークビジター多い + コンバージョン低い = 幅広い層に届いているが購入がない → 層のミスマッチ</li>
      </UL>

      <Callout tone="info" title="不正防止の重複除外とは？">
        同じ日の訪問者の繰り返しクリックをカウントするプラットフォームは、数字を水増ししてしまいます。BeyLinkはファーストパーティのCookieと訪問者IDを使い、
        <strong>本当のユニーク数</strong>を算出します。見かけだけ大きな数字ではなく、意味のあるデータです。
      </Callout>

      <H2>まとめ</H2>
      <P>
        アナリティクスなしのマーケティングは、暗闇での撃ち合いです。上記の8つの指標を毎週追いましょう。わからないものは問い直し、うまくいっているものは伸ばす。
        半年後には、あなたの判断は直感ではなく科学に支えられているはずです。
      </P>
      <P>
        <A href="/register">BeyLinkを始めて</A>、最初のBTAGを作り、最初のキャンペーンレポートを取り出してみましょう。
      </P>
    </>
  );
}

export default function Post() {
  const { lang } = useLanguage();
  return lang === 'ja' ? <PostJa /> : lang === 'it' ? <PostIt /> : lang === 'pt' ? <PostPt /> : lang === 'fr' ? <PostFr /> : lang === 'de' ? <PostDe /> : lang === 'ru' ? <PostRu /> : lang === 'es' ? <PostEs /> : lang === 'en' ? <PostEn /> : <PostTr />;
}
