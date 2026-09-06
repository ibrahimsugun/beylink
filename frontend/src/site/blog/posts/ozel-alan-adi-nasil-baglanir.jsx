import { H2, H3, P, UL, OL, A, Callout, InlineCta } from '../PostBody.jsx';
import { useLanguage } from '../../../context/LanguageContext.jsx';

export const meta = {
  slug: 'custom-domain-guide',
  title: {
    tr: 'Özel Alan Adı Nasıl Bağlanır? BeyLink Adım Adım Rehber',
    en: 'How to Connect a Custom Domain to Your BeyLink Page',
    ru: 'Как подключить свой домен к странице BeyLink',
    es: 'Cómo conectar un dominio propio a tu página BeyLink',
    de: 'Eigene Domain mit deiner BeyLink-Seite verbinden',
    fr: 'Connecter un domaine personnalisé à votre page BeyLink',
    pt: 'Como conectar um domínio próprio à sua página BeyLink',
    it: 'Come collegare un dominio personalizzato alla pagina BeyLink',
    ja: 'BeyLinkページに独自ドメインをつなぐ方法',
  },
  description: {
    tr: 'Kendi alan adını BeyLink profiline bağla: A ve CNAME kayıtları, TXT doğrulama, ücretsiz HTTPS ve adım adım kurulum rehberi.',
    en: 'Connect your own domain to your BeyLink profile: A and CNAME records, TXT verification, free HTTPS, and a step-by-step setup guide.',
    ru: 'Подключите свой домен к профилю BeyLink: записи A и CNAME, проверка TXT, бесплатный HTTPS и пошаговый гид по настройке.',
    es: 'Conecta tu propio dominio a tu perfil de BeyLink: registros A y CNAME, verificación TXT, HTTPS gratis y una guía de configuración paso a paso.',
    de: 'Verbinde deine eigene Domain mit deinem BeyLink-Profil: A- und CNAME-Einträge, TXT-Prüfung, kostenloses HTTPS und Schritt-für-Schritt-Anleitung.',
    fr: 'Connectez votre propre domaine à votre profil BeyLink : enregistrements A et CNAME, vérification TXT, HTTPS gratuit et guide pas à pas.',
    pt: 'Conecte o seu próprio domínio ao perfil BeyLink: registros A e CNAME, verificação TXT, HTTPS grátis e um guia de configuração passo a passo.',
    it: 'Collega il tuo dominio al profilo BeyLink: record A e CNAME, verifica TXT, HTTPS gratuito e una guida passo dopo passo.',
    ja: '自分のドメインをBeyLinkプロフィールにつなぐ方法。AレコードとCNAME、TXT認証、無料HTTPS、手順ガイドまで解説します。',
  },
  category: 'araclar',
  tags: {
    tr: ['özel alan adı', 'domain', 'dns', 'https'],
    en: ['custom domain', 'domain', 'dns', 'https'],
    ru: ['свой домен', 'домен', 'dns', 'https'],
    es: ['dominio propio', 'dominio', 'dns', 'https'],
    de: ['eigene domain', 'domain', 'dns', 'https'],
    fr: ['domaine personnalisé', 'domaine', 'dns', 'https'],
    pt: ['domínio próprio', 'domínio', 'dns', 'https'],
    it: ['dominio personalizzato', 'dominio', 'dns', 'https'],
    ja: ['独自ドメイン', 'ドメイン', 'dns', 'https'],
  },
  publishedAt: '2026-07-11',
  updatedAt: '2026-07-11',
  readingMinutes: 6,
  image: '/og-image.png',
  faq: {
    tr: [
      { q: 'Alan adını BeyLink\'ten mi almam gerekiyor?', a: 'Hayır. BeyLink alan adı satmaz; kendi sahip olduğun alan adını bağlarsın. Alan adını herhangi bir kayıt firmasından (registrar) alabilir, sonra BeyLink panelinden birkaç DNS kaydıyla bağlayabilirsin.' },
      { q: 'Doğrulama ne kadar sürer?', a: 'DNS kayıtlarını ekledikten sonra doğrulama genelde birkaç dakika içinde geçer. Ancak DNS yayılımı (propagation) anlık değildir; bazı sağlayıcılarda 48 saate kadar sürebilir. İlk denemede geçmezse biraz bekleyip tekrar Doğrula\'ya bas.' },
      { q: 'Birden fazla özel alan adı kullanabilir miyim?', a: 'Şimdilik hesap başına bir özel alan adı bağlayabilirsin. Özel alan adı Pro Plus planına özel bir özelliktir.' },
    ],
    en: [
      { q: 'Do I need to buy the domain from BeyLink?', a: 'No. BeyLink does not sell domains; you connect a domain you already own. Buy it from any registrar you like, then link it in the BeyLink panel with a couple of DNS records.' },
      { q: 'How long does verification take?', a: 'Once your DNS records are in place, verification usually passes within a few minutes. But DNS propagation isn\'t instant; with some providers it can take up to 48 hours. If it doesn\'t pass on the first try, wait a bit and hit Verify again.' },
      { q: 'Can I use more than one custom domain?', a: 'For now you can connect one custom domain per account. The custom domain feature is exclusive to the Pro Plus plan.' },
    ],
    ru: [
      { q: 'Нужно ли покупать домен у BeyLink?', a: 'Нет. BeyLink не продаёт домены; вы подключаете домен, который у вас уже есть. Купите его у любого регистратора, а затем подключите в панели BeyLink с помощью пары DNS-записей.' },
      { q: 'Сколько длится проверка?', a: 'Когда DNS-записи на месте, проверка обычно проходит за несколько минут. Но распространение DNS не мгновенное; у некоторых провайдеров оно может занять до 48 часов. Если с первого раза не прошло, немного подождите и снова нажмите Проверить.' },
      { q: 'Можно ли использовать несколько своих доменов?', a: 'Пока можно подключить один свой домен на аккаунт. Функция своего домена доступна только на плане Pro Plus.' },
    ],
    es: [
      { q: '¿Tengo que comprar el dominio en BeyLink?', a: 'No. BeyLink no vende dominios; conectas un dominio que ya es tuyo. Cómpralo en el registrador que prefieras y luego enlázalo en el panel de BeyLink con un par de registros DNS.' },
      { q: '¿Cuánto tarda la verificación?', a: 'Una vez que tus registros DNS están en su sitio, la verificación suele pasar en unos minutos. Pero la propagación del DNS no es instantánea; con algunos proveedores puede tardar hasta 48 horas. Si no pasa al primer intento, espera un poco y vuelve a pulsar Verificar.' },
      { q: '¿Puedo usar más de un dominio propio?', a: 'Por ahora puedes conectar un dominio propio por cuenta. La función de dominio propio es exclusiva del plan Pro Plus.' },
    ],
    de: [
      { q: 'Muss ich die Domain bei BeyLink kaufen?', a: 'Nein. BeyLink verkauft keine Domains; du verbindest eine Domain, die dir bereits gehört. Kauf sie bei einem beliebigen Registrar und verknüpfe sie dann im BeyLink-Panel mit ein paar DNS-Einträgen.' },
      { q: 'Wie lange dauert die Verifizierung?', a: 'Sobald deine DNS-Einträge stehen, geht die Verifizierung meist innerhalb weniger Minuten durch. Aber die DNS-Verbreitung erfolgt nicht sofort; bei manchen Anbietern kann sie bis zu 48 Stunden dauern. Klappt es beim ersten Versuch nicht, warte kurz und tippe erneut auf Verifizieren.' },
      { q: 'Kann ich mehr als eine eigene Domain nutzen?', a: 'Aktuell kannst du eine eigene Domain pro Konto verbinden. Die eigene Domain ist eine Funktion, die dem Pro-Plus-Tarif vorbehalten ist.' },
    ],
    fr: [
      { q: 'Dois-je acheter le domaine chez BeyLink ?', a: 'Non. BeyLink ne vend pas de domaines ; vous connectez un domaine que vous possédez déjà. Achetez-le chez le registrar de votre choix, puis reliez-le dans le panneau BeyLink avec quelques enregistrements DNS.' },
      { q: 'Combien de temps prend la vérification ?', a: 'Une fois vos enregistrements DNS en place, la vérification passe généralement en quelques minutes. Mais la propagation DNS n\'est pas instantanée ; chez certains fournisseurs, elle peut prendre jusqu\'à 48 heures. Si elle ne passe pas du premier coup, patientez un peu et appuyez de nouveau sur Vérifier.' },
      { q: 'Puis-je utiliser plusieurs domaines personnalisés ?', a: 'Pour l\'instant, vous pouvez connecter un seul domaine personnalisé par compte. Le domaine personnalisé est une fonctionnalité réservée au forfait Pro Plus.' },
    ],
    pt: [
      { q: 'Preciso comprar o domínio no BeyLink?', a: 'Não. O BeyLink não vende domínios; você conecta um domínio que já é seu. Compre em qualquer registrador que preferir e depois faça a ligação no painel do BeyLink com alguns registros DNS.' },
      { q: 'Quanto tempo leva a verificação?', a: 'Depois que os seus registros DNS estão no lugar, a verificação costuma passar em poucos minutos. Mas a propagação do DNS não é instantânea; em alguns provedores pode levar até 48 horas. Se não passar na primeira tentativa, espere um pouco e toque em Verificar de novo.' },
      { q: 'Posso usar mais de um domínio próprio?', a: 'Por enquanto você pode conectar um domínio próprio por conta. O domínio próprio é um recurso exclusivo do plano Pro Plus.' },
    ],
    it: [
      { q: 'Devo comprare il dominio da BeyLink?', a: 'No. BeyLink non vende domini; colleghi un dominio che possiedi già. Compralo dal registrar che preferisci, poi collegalo nel pannello BeyLink con un paio di record DNS.' },
      { q: 'Quanto tempo richiede la verifica?', a: 'Una volta inseriti i record DNS, la verifica in genere passa in pochi minuti. Ma la propagazione DNS non è istantanea; con alcuni provider può richiedere fino a 48 ore. Se non passa al primo tentativo, aspetta un po\' e premi di nuovo Verifica.' },
      { q: 'Posso usare più di un dominio personalizzato?', a: 'Per ora puoi collegare un dominio personalizzato per account. Il dominio personalizzato è una funzione esclusiva del piano Pro Plus.' },
    ],
    ja: [
      { q: 'ドメインはBeyLinkで買う必要がありますか？', a: 'いいえ。BeyLinkはドメインを販売していません。つなぐのは、すでにお持ちのドメインです。好きなレジストラで購入したうえで、BeyLinkのパネルからいくつかのDNSレコードを追加して連携します。' },
      { q: '認証にはどれくらいかかりますか？', a: 'DNSレコードを設定すれば、認証はたいてい数分で通ります。ただしDNSの伝播（propagation）は瞬時ではなく、プロバイダーによっては最大48時間ほどかかることがあります。最初の試行で通らなければ、少し待ってからもう一度「認証」を押してください。' },
      { q: '独自ドメインを複数使えますか？', a: '今のところ、1アカウントにつき独自ドメインを1つつなげます。独自ドメインはPro Plusプラン限定の機能です。' },
    ],
  },
};

function PostTr() {
  return (
    <>
      <P>
        <code>beylink.org/kullaniciadi</code> gayet iş görür, ama bir noktadan sonra kendi markanı istersin:{' '}
        <code>seninsiten.com</code>. Kartvizitine, e-posta imzana, Instagram bio'na bunu yazdığında verdiğin izlenim
        bambaşka. İyi haber: BeyLink'te sahip olduğun alan adını profiline bağlamak birkaç dakikalık bir iş. Bu
        rehberde nasıl yapıldığını baştan sona anlatıyoruz.
      </P>

      <H2>Özel alan adı neden önemli?</H2>
      <P>
        Bir link-in-bio sayfası aslında dijital vitrinindir. O vitrinin adresi de markanın bir parçası. İşte özel alan
        adının fark yarattığı yerler:
      </P>
      <UL>
        <li><strong>Marka güveni:</strong> Ziyaretçi kendi adını taşıyan bir adres görünce sayfayı daha güvenilir bulur.</li>
        <li><strong>Akılda kalıcılık:</strong> <code>seninsiten.com</code> söylemesi ve hatırlaması kolaydır; kimse uzun bir kullanıcı adını ezberlemek zorunda kalmaz.</li>
        <li><strong>Profesyonel duruş:</strong> İşletmeler ve ciddi içerik üreticileri için kendi alan adı, "bu işi ciddiye alıyorum" mesajını verir.</li>
        <li><strong>Tutarlılık:</strong> Web siten, e-postan ve link sayfan aynı marka altında toplanır.</li>
      </UL>

      <H2>Başlamadan önce neye ihtiyacın var?</H2>
      <P>
        Kuruluma geçmeden iki şeyi hazır etmen gerekiyor:
      </P>
      <UL>
        <li><strong>Sahip olduğun bir alan adı:</strong> BeyLink alan adı satmaz. Alan adını daha önce herhangi bir kayıt firmasından aldıysan hazırsın. Almadıysan önce bir registrar'dan satın al, sonra buraya dön.</li>
        <li><strong>Pro Plus plan:</strong> Özel alan adı, Pro Plus planına özel bir özelliktir. Daha alt bir plandaysan bağlamadan önce yükseltmen gerekir.</li>
      </UL>

      <Callout tone="info" title="Alan adı satın alma dahil değildir">
        BeyLink yalnızca senin sahip olduğun bir alan adını bağlar; alan adının kendisini satmaz. Alan adını GoDaddy,
        Namecheap, Cloudflare gibi dilediğin bir kayıt firmasından alabilirsin.
      </Callout>

      <H2>Bağlama nasıl çalışıyor?</H2>
      <P>
        Teknik gibi görünüyor ama mantığı basit: alan adının, ziyaretçileri BeyLink sunucusuna yönlendirmesi gerekiyor.
        Bunu birkaç DNS kaydıyla yapıyoruz.
      </P>

      <H3>A kaydı mı, CNAME mi?</H3>
      <P>
        Panel sana iki seçenek gösterir; DNS sağlayıcının ve kurulumunun izin verdiğini seç:
      </P>
      <UL>
        <li><strong>A kaydı:</strong> Kök (apex) alan adını, örneğin <code>seninsiten.com</code>, doğrudan BeyLink sunucusunun IP adresine yönlendirir. Kök alan adları teknik olarak CNAME kullanamaz, bu yüzden <code>seninsiten.com</code> gibi köklü bir adres için A kaydı gerekir.</li>
        <li><strong>CNAME kaydı:</strong> Bir alt alan adını, genelde <code>www</code>, <code>cname.beylink.org</code> adresine yönlendirir. Alt alan adı kullanacaksan bu yol daha rahattır.</li>
      </UL>
      <P>
        Panel her iki kaydın da tam değerlerini gösterir; sen sadece kopyalayıp DNS sağlayıcına yapıştırırsın.
      </P>

      <H3>TXT ile sahiplik doğrulama (opsiyonel)</H3>
      <P>
        Ekstra güvenlik için bir de <strong>TXT kaydı</strong> ekleyebilirsin:{' '}
        <code>_beylink-verify.senindomainin.com</code>. Bu kayıt alan adının gerçekten sana ait olduğunu kanıtlar.
        Zorunlu değildir, ama önerilir.
      </P>

      <H3>Doğrulama ve ücretsiz HTTPS</H3>
      <P>
        Kayıtları ekledikten sonra panelde <strong>Doğrula</strong> düğmesine basarsın. DNS kontrolü geçince alan adın{' '}
        <strong>Aktif</strong> duruma geçer ve BeyLink senin için otomatik olarak ücretsiz bir SSL sertifikası (HTTPS)
        oluşturur. Sertifika yönetimiyle asla uğraşmazsın; hepsi arka planda halledilir.
      </P>

      <Callout tone="warning" title="DNS yayılımı anlık değildir">
        Kayıtları ekledin ama doğrulama ilk denemede geçmedi mi? Panik yok. DNS yayılımı birkaç dakikadan 48 saate kadar
        sürebilir. Biraz bekle, sonra tekrar Doğrula'ya bas.
      </Callout>

      <P>
        Alan adın aktif olduğunda, <code>seninsiten.com</code> adresine giren herkes doğrudan bağlı profilini görür. Bu
        arada sayfan <code>beylink.org</code> üzerinden de çalışmaya devam eder; ikisi birden geçerlidir.
      </P>

      <InlineCta
        title="Kendi alan adını bağla"
        desc="Pro Plus panelinde Özel Alan Adı bölümünden alan adını ekle, DNS kayıtlarını kopyala, dakikalar içinde yayında ol."
        href="/dashboard/domains"
        label="Özel Alan Adına Git →"
      />

      <H2>Adım adım kurulum</H2>
      <OL>
        <li>BeyLink panelinde <strong>Özel Alan Adı</strong> bölümüne git.</li>
        <li>Bağlamak istediğin alan adını gir (örneğin <code>seninsiten.com</code>).</li>
        <li>Panelin gösterdiği <strong>DNS kayıtlarını kopyala</strong>: A kaydı veya CNAME (ve istersen TXT).</li>
        <li>Alan adını aldığın kayıt firmasının ya da DNS sağlayıcının paneline git ve bu kayıtları ekle. Arayüz sağlayıcıya göre değişir (GoDaddy, Namecheap, Cloudflare vb.), ama mantık her yerde aynıdır: kayıt tipini, adı ve değeri gir.</li>
        <li>BeyLink'e geri dön ve <strong>Doğrula</strong> düğmesine bas.</li>
        <li>Doğrulama geçince alan adın Aktif olur ve HTTPS otomatik devreye girer. Hazırsın.</li>
      </OL>

      <H2>Pratik ipuçları</H2>
      <UL>
        <li><strong>Şimdilik tek alan adı:</strong> Hesap başına bir özel alan adı bağlayabilirsin.</li>
        <li><strong>Pro Plus'a özel:</strong> Bu özellik yalnızca Pro Plus planında açıktır. Alt bir plandaysan önce yükselt.</li>
        <li><strong>Alan adını sen alırsın:</strong> BeyLink alan adı satmaz; dilediğin registrar'dan satın al, sonra bağla.</li>
        <li><strong>Doğrulama geçmezse bekle:</strong> Neredeyse her zaman sorun DNS yayılımının henüz tamamlanmamasıdır; bir süre sonra tekrar dene.</li>
      </UL>

      <H2>Sonuç</H2>
      <P>
        Kendi alan adın, link sayfanı gerçek bir markaya dönüştüren son dokunuştur. Kurulumu birkaç DNS kaydından
        ibaret, HTTPS otomatik geliyor ve sonrasında her şey aynı BeyLink kolaylığıyla çalışıyor.
      </P>
      <P>
        <A href="/register">BeyLink'e başla</A>, Pro Plus'a geç ve <code>seninsiten.com</code> adresini bugün kendi
        sayfana bağla.
      </P>
    </>
  );
}

function PostEn() {
  return (
    <>
      <P>
        <code>beylink.org/username</code> does the job just fine, but at some point you want your own brand out front:{' '}
        <code>yoursite.com</code>. Put that on your business card, in your email signature, or in your Instagram bio, and
        the impression you make is a different league. The good news: connecting a domain you own to your BeyLink profile
        takes just a few minutes. This guide walks you through the whole thing.
      </P>

      <H2>Why a custom domain matters</H2>
      <P>
        A link-in-bio page is really your digital storefront, and the address on the door is part of your brand. Here is
        where a custom domain makes a difference:
      </P>
      <UL>
        <li><strong>Brand trust:</strong> visitors find a page more credible when the address carries your own name.</li>
        <li><strong>Memorability:</strong> <code>yoursite.com</code> is easy to say and easy to remember; nobody has to memorize a long username.</li>
        <li><strong>A professional feel:</strong> for businesses and serious creators, your own domain sends a clear "I take this seriously" signal.</li>
        <li><strong>Consistency:</strong> your website, your email, and your link page all live under one brand.</li>
      </UL>

      <H2>What you need before you start</H2>
      <P>
        Two things need to be in place before setup:
      </P>
      <UL>
        <li><strong>A domain you own:</strong> BeyLink doesn't sell domains. If you already bought one from a registrar, you're ready. If not, buy one from any registrar first, then come back here.</li>
        <li><strong>The Pro Plus plan:</strong> the custom domain is a Pro Plus exclusive. If you're on a lower plan, you'll need to upgrade before connecting.</li>
      </UL>

      <Callout tone="info" title="The domain purchase isn't included">
        BeyLink only connects a domain you already own; it doesn't sell the domain itself. Buy your domain from any
        registrar you like, such as GoDaddy, Namecheap, or Cloudflare.
      </Callout>

      <H2>How the connection works</H2>
      <P>
        It looks technical, but the logic is simple: your domain needs to point visitors at BeyLink's server. We do that
        with a couple of DNS records.
      </P>

      <H3>An A record or a CNAME?</H3>
      <P>
        The panel shows you two options; pick whichever your DNS provider and setup allow:
      </P>
      <UL>
        <li><strong>A record:</strong> points your root (apex) domain, for example <code>yoursite.com</code>, straight at BeyLink's server IP address. Root domains technically can't use a CNAME, so an apex address like <code>yoursite.com</code> needs the A record.</li>
        <li><strong>CNAME record:</strong> points a subdomain, typically <code>www</code>, at <code>cname.beylink.org</code>. If you're using a subdomain, this route is the easiest.</li>
      </UL>
      <P>
        The panel shows the exact values for both records; you just copy them and paste them into your DNS provider.
      </P>

      <H3>Prove ownership with TXT (optional)</H3>
      <P>
        For extra security you can also add a <strong>TXT record</strong>:{' '}
        <code>_beylink-verify.yourdomain.com</code>. This record proves the domain really belongs to you. It isn't
        required, but it's recommended.
      </P>

      <H3>Verification and free HTTPS</H3>
      <P>
        Once your records are in, you hit the <strong>Verify</strong> button in the panel. When the DNS check passes,
        your domain flips to <strong>Active</strong> and BeyLink automatically issues a free SSL certificate (HTTPS) for
        you. You never touch certificate management; it's all handled behind the scenes.
      </P>

      <Callout tone="warning" title="DNS propagation isn't instant">
        Added the records but verification didn't pass on the first try? No panic. DNS propagation can take anywhere
        from a few minutes up to 48 hours. Wait a bit, then hit Verify again.
      </Callout>

      <P>
        Once your domain is active, anyone who visits <code>yoursite.com</code> lands directly on your connected profile
        at the root path. Meanwhile your page keeps working on <code>beylink.org</code> too; both are valid at once.
      </P>

      <InlineCta
        title="Connect your own domain"
        desc="In the Pro Plus panel, open Custom Domain, add your domain, copy the DNS records, and go live in minutes."
        href="/dashboard/domains"
        label="Go to Custom Domain →"
      />

      <H2>Step-by-step setup</H2>
      <OL>
        <li>In the BeyLink panel, go to the <strong>Custom Domain</strong> section.</li>
        <li>Enter the domain you want to connect (for example <code>yoursite.com</code>).</li>
        <li><strong>Copy the DNS records</strong> the panel shows you: an A record or a CNAME (and a TXT if you like).</li>
        <li>Go to the panel of the registrar or DNS provider where you bought the domain, and add those records. The interface varies by provider (GoDaddy, Namecheap, Cloudflare, and so on), but the logic is the same everywhere: enter the record type, the name, and the value.</li>
        <li>Come back to BeyLink and click the <strong>Verify</strong> button.</li>
        <li>When verification passes, your domain goes Active and HTTPS kicks in automatically. You're done.</li>
      </OL>

      <H2>Practical tips</H2>
      <UL>
        <li><strong>One domain for now:</strong> you can connect one custom domain per account.</li>
        <li><strong>Pro Plus only:</strong> this feature is unlocked on the Pro Plus plan only. On a lower plan, upgrade first.</li>
        <li><strong>You buy the domain:</strong> BeyLink doesn't sell domains; buy from any registrar, then connect.</li>
        <li><strong>If verification fails, wait:</strong> almost always the cause is DNS propagation not being finished yet; try again a little later.</li>
      </UL>

      <H2>Conclusion</H2>
      <P>
        Your own domain is the finishing touch that turns your link page into a real brand. Setup is just a couple of DNS
        records, HTTPS comes automatically, and after that everything runs with the same BeyLink ease you already know.
      </P>
      <P>
        <A href="/register">Start with BeyLink</A>, move up to Pro Plus, and connect <code>yoursite.com</code> to your
        page today.
      </P>
    </>
  );
}

function PostRu() {
  return (
    <>
      <P>
        <code>beylink.org/username</code> вполне справляется со своей задачей, но в какой-то момент хочется вывести на
        первый план собственный бренд: <code>yoursite.com</code>. Напишите такой адрес на визитке, в подписи к письму
        или в шапке Instagram, и впечатление, которое вы производите, будет совсем другого уровня. Хорошая новость:
        подключить домен, которым вы владеете, к профилю BeyLink займёт всего несколько минут. В этом руководстве мы
        проведём вас через весь процесс от начала до конца.
      </P>

      <H2>Почему важен свой домен</H2>
      <P>
        Страница link-in-bio по сути ваша цифровая витрина, а адрес на её двери это часть вашего бренда. Вот где свой
        домен действительно меняет дело:
      </P>
      <UL>
        <li><strong>Доверие к бренду:</strong> посетители находят страницу более убедительной, когда в адресе стоит ваше собственное имя.</li>
        <li><strong>Запоминаемость:</strong> <code>yoursite.com</code> легко произнести и легко запомнить; никому не придётся заучивать длинное имя пользователя.</li>
        <li><strong>Профессиональное ощущение:</strong> для бизнеса и серьёзных авторов свой домен посылает чёткий сигнал «я отношусь к этому серьёзно».</li>
        <li><strong>Единство:</strong> ваш сайт, ваша почта и ваша страница ссылок живут под одним брендом.</li>
      </UL>

      <H2>Что нужно перед началом</H2>
      <P>
        Перед настройкой на месте должны быть две вещи:
      </P>
      <UL>
        <li><strong>Домен, которым вы владеете:</strong> BeyLink не продаёт домены. Если вы уже купили домен у регистратора, вы готовы. Если нет, сначала купите его у любого регистратора, а потом возвращайтесь сюда.</li>
        <li><strong>План Pro Plus:</strong> свой домен это возможность только для Pro Plus. Если у вас план ниже, перед подключением нужно перейти на Pro Plus.</li>
      </UL>

      <Callout tone="info" title="Покупка домена не входит в план">
        BeyLink лишь подключает домен, которым вы уже владеете; сам домен он не продаёт. Купите свой домен у любого
        удобного регистратора, например GoDaddy, Namecheap или Cloudflare.
      </Callout>

      <H2>Как работает подключение</H2>
      <P>
        Выглядит технически, но логика проста: ваш домен должен направлять посетителей на сервер BeyLink. Мы делаем это
        с помощью пары DNS-записей.
      </P>

      <H3>Запись A или CNAME?</H3>
      <P>
        Панель показывает вам два варианта; выбирайте тот, который допускают ваш DNS-провайдер и настройка:
      </P>
      <UL>
        <li><strong>Запись A:</strong> направляет ваш корневой (apex) домен, например <code>yoursite.com</code>, прямо на IP-адрес сервера BeyLink. Корневые домены технически не могут использовать CNAME, поэтому для apex-адреса вроде <code>yoursite.com</code> нужна запись A.</li>
        <li><strong>Запись CNAME:</strong> направляет поддомен, обычно <code>www</code>, на <code>cname.beylink.org</code>. Если вы используете поддомен, этот путь самый простой.</li>
      </UL>
      <P>
        Панель показывает точные значения для обеих записей; вам остаётся лишь скопировать их и вставить в свой
        DNS-провайдер.
      </P>

      <H3>Подтверждение владения через TXT (необязательно)</H3>
      <P>
        Для дополнительной безопасности можно также добавить <strong>запись TXT</strong>:{' '}
        <code>_beylink-verify.yourdomain.com</code>. Эта запись доказывает, что домен действительно принадлежит вам.
        Она не обязательна, но рекомендуется.
      </P>

      <H3>Проверка и бесплатный HTTPS</H3>
      <P>
        Когда записи на месте, вы нажимаете кнопку <strong>Проверить</strong> в панели. Когда проверка DNS проходит,
        ваш домен переключается в статус <strong>Активен</strong>, и BeyLink автоматически выпускает для вас
        бесплатный SSL-сертификат (HTTPS). Вам никогда не приходится заниматься управлением сертификатами; всё
        решается за кулисами.
      </P>

      <Callout tone="warning" title="Распространение DNS не мгновенное">
        Добавили записи, а проверка с первого раза не прошла? Без паники. Распространение DNS может занять от нескольких
        минут до 48 часов. Немного подождите, затем снова нажмите Проверить.
      </Callout>

      <P>
        Когда ваш домен активен, любой, кто зайдёт на <code>yoursite.com</code>, попадает прямо на подключённый профиль
        по корневому пути. При этом ваша страница продолжает работать и на <code>beylink.org</code>; оба адреса
        действительны одновременно.
      </P>

      <InlineCta
        title="Подключите свой домен"
        desc="В панели Pro Plus откройте раздел «Свой домен», добавьте домен, скопируйте DNS-записи и запуститесь за считанные минуты."
        href="/dashboard/domains"
        label="Перейти к своему домену →"
      />

      <H2>Пошаговая настройка</H2>
      <OL>
        <li>В панели BeyLink перейдите в раздел <strong>Свой домен</strong>.</li>
        <li>Введите домен, который хотите подключить (например, <code>yoursite.com</code>).</li>
        <li><strong>Скопируйте DNS-записи</strong>, которые показывает панель: запись A или CNAME (и TXT, если хотите).</li>
        <li>Перейдите в панель регистратора или DNS-провайдера, у которого вы купили домен, и добавьте эти записи. Интерфейс отличается у разных провайдеров (GoDaddy, Namecheap, Cloudflare и так далее), но логика везде одна: укажите тип записи, имя и значение.</li>
        <li>Вернитесь в BeyLink и нажмите кнопку <strong>Проверить</strong>.</li>
        <li>Когда проверка проходит, ваш домен становится Активным, а HTTPS включается автоматически. Готово.</li>
      </OL>

      <H2>Практические советы</H2>
      <UL>
        <li><strong>Пока один домен:</strong> на аккаунт можно подключить один свой домен.</li>
        <li><strong>Только Pro Plus:</strong> эта функция открыта только на плане Pro Plus. Если у вас план ниже, сначала перейдите на него.</li>
        <li><strong>Домен покупаете вы:</strong> BeyLink не продаёт домены; купите у любого регистратора, а затем подключите.</li>
        <li><strong>Если проверка не проходит, подождите:</strong> почти всегда причина в том, что распространение DNS ещё не завершилось; попробуйте снова чуть позже.</li>
      </UL>

      <H2>Заключение</H2>
      <P>
        Собственный домен это финальный штрих, который превращает вашу страницу ссылок в настоящий бренд. Настройка это
        всего пара DNS-записей, HTTPS приходит автоматически, а дальше всё работает с той же лёгкостью BeyLink, которая
        вам уже знакома.
      </P>
      <P>
        <A href="/register">Начните с BeyLink</A>, перейдите на Pro Plus и подключите <code>yoursite.com</code> к своей
        странице уже сегодня.
      </P>
    </>
  );
}

function PostEs() {
  return (
    <>
      <P>
        <code>beylink.org/username</code> cumple perfectamente, pero en algún momento quieres poner tu propia marca por
        delante: <code>yoursite.com</code>. Ponlo en tu tarjeta de visita, en la firma de tu correo o en tu bio de
        Instagram, y la impresión que causas es de otra liga. La buena noticia: conectar un dominio que ya es tuyo a tu
        perfil de BeyLink lleva apenas unos minutos. Esta guía te lleva por todo el proceso de principio a fin.
      </P>

      <H2>Por qué importa un dominio propio</H2>
      <P>
        Una página link-in-bio es en realidad tu escaparate digital, y la dirección de la puerta forma parte de tu
        marca. Aquí es donde un dominio propio marca la diferencia:
      </P>
      <UL>
        <li><strong>Confianza de marca:</strong> los visitantes encuentran una página más creíble cuando la dirección lleva tu propio nombre.</li>
        <li><strong>Memorabilidad:</strong> <code>yoursite.com</code> es fácil de decir y fácil de recordar; nadie tiene que memorizar un nombre de usuario largo.</li>
        <li><strong>Un aire profesional:</strong> para empresas y creadores serios, tu propio dominio manda una señal clara de "me tomo esto en serio".</li>
        <li><strong>Coherencia:</strong> tu web, tu correo y tu página de enlaces viven bajo una sola marca.</li>
      </UL>

      <H2>Qué necesitas antes de empezar</H2>
      <P>
        Dos cosas tienen que estar listas antes de la configuración:
      </P>
      <UL>
        <li><strong>Un dominio que sea tuyo:</strong> BeyLink no vende dominios. Si ya compraste uno en un registrador, estás listo. Si no, compra uno en el registrador que quieras primero y luego vuelve aquí.</li>
        <li><strong>El plan Pro Plus:</strong> el dominio propio es exclusivo de Pro Plus. Si estás en un plan inferior, tendrás que mejorarlo antes de conectar.</li>
      </UL>

      <Callout tone="info" title="La compra del dominio no está incluida">
        BeyLink solo conecta un dominio que ya es tuyo; no vende el dominio en sí. Compra tu dominio en el registrador
        que prefieras, como GoDaddy, Namecheap o Cloudflare.
      </Callout>

      <H2>Cómo funciona la conexión</H2>
      <P>
        Parece técnico, pero la lógica es sencilla: tu dominio necesita dirigir a los visitantes al servidor de BeyLink.
        Eso lo hacemos con un par de registros DNS.
      </P>

      <H3>¿Un registro A o un CNAME?</H3>
      <P>
        El panel te muestra dos opciones; elige la que permitan tu proveedor de DNS y tu configuración:
      </P>
      <UL>
        <li><strong>Registro A:</strong> apunta tu dominio raíz (apex), por ejemplo <code>yoursite.com</code>, directamente a la dirección IP del servidor de BeyLink. Los dominios raíz técnicamente no pueden usar un CNAME, así que una dirección apex como <code>yoursite.com</code> necesita el registro A.</li>
        <li><strong>Registro CNAME:</strong> apunta un subdominio, normalmente <code>www</code>, a <code>cname.beylink.org</code>. Si vas a usar un subdominio, esta ruta es la más fácil.</li>
      </UL>
      <P>
        El panel muestra los valores exactos de ambos registros; tú solo los copias y los pegas en tu proveedor de DNS.
      </P>

      <H3>Demuestra la propiedad con TXT (opcional)</H3>
      <P>
        Para mayor seguridad también puedes añadir un <strong>registro TXT</strong>:{' '}
        <code>_beylink-verify.yourdomain.com</code>. Este registro demuestra que el dominio realmente te pertenece. No es
        obligatorio, pero es recomendable.
      </P>

      <H3>Verificación y HTTPS gratis</H3>
      <P>
        Una vez que tus registros están puestos, pulsas el botón <strong>Verificar</strong> en el panel. Cuando la
        comprobación de DNS pasa, tu dominio cambia a <strong>Activo</strong> y BeyLink emite automáticamente un
        certificado SSL gratuito (HTTPS) por ti. Nunca tocas la gestión de certificados; todo se resuelve entre
        bastidores.
      </P>

      <Callout tone="warning" title="La propagación del DNS no es instantánea">
        ¿Añadiste los registros pero la verificación no pasó al primer intento? Sin pánico. La propagación del DNS puede
        tardar desde unos minutos hasta 48 horas. Espera un poco y vuelve a pulsar Verificar.
      </Callout>

      <P>
        Cuando tu dominio está activo, cualquiera que visite <code>yoursite.com</code> aterriza directamente en tu perfil
        conectado, en la ruta raíz. Mientras tanto, tu página sigue funcionando también en <code>beylink.org</code>;
        ambas son válidas a la vez.
      </P>

      <InlineCta
        title="Conecta tu propio dominio"
        desc="En el panel de Pro Plus, abre Dominio propio, añade tu dominio, copia los registros DNS y ponlo en marcha en minutos."
        href="/dashboard/domains"
        label="Ir a Dominio propio →"
      />

      <H2>Configuración paso a paso</H2>
      <OL>
        <li>En el panel de BeyLink, ve a la sección <strong>Dominio propio</strong>.</li>
        <li>Introduce el dominio que quieres conectar (por ejemplo <code>yoursite.com</code>).</li>
        <li><strong>Copia los registros DNS</strong> que te muestra el panel: un registro A o un CNAME (y un TXT si quieres).</li>
        <li>Ve al panel del registrador o proveedor de DNS donde compraste el dominio y añade esos registros. La interfaz varía según el proveedor (GoDaddy, Namecheap, Cloudflare, etc.), pero la lógica es la misma en todas partes: introduce el tipo de registro, el nombre y el valor.</li>
        <li>Vuelve a BeyLink y haz clic en el botón <strong>Verificar</strong>.</li>
        <li>Cuando la verificación pasa, tu dominio se pone Activo y el HTTPS entra en marcha automáticamente. Listo.</li>
      </OL>

      <H2>Consejos prácticos</H2>
      <UL>
        <li><strong>Un dominio por ahora:</strong> puedes conectar un dominio propio por cuenta.</li>
        <li><strong>Solo Pro Plus:</strong> esta función está desbloqueada únicamente en el plan Pro Plus. Si estás en un plan inferior, mejóralo primero.</li>
        <li><strong>El dominio lo compras tú:</strong> BeyLink no vende dominios; cómpralo en el registrador que quieras y luego conéctalo.</li>
        <li><strong>Si la verificación falla, espera:</strong> casi siempre la causa es que la propagación del DNS aún no ha terminado; inténtalo de nuevo un poco más tarde.</li>
      </UL>

      <H2>Conclusión</H2>
      <P>
        Tu propio dominio es el toque final que convierte tu página de enlaces en una marca de verdad. La configuración
        es solo un par de registros DNS, el HTTPS llega automáticamente y, a partir de ahí, todo funciona con la misma
        facilidad de BeyLink que ya conoces.
      </P>
      <P>
        <A href="/register">Empieza con BeyLink</A>, pásate a Pro Plus y conecta <code>yoursite.com</code> a tu página
        hoy mismo.
      </P>
    </>
  );
}

function PostDe() {
  return (
    <>
      <P>
        <code>beylink.org/username</code> erfüllt seinen Zweck völlig, aber irgendwann willst du deine eigene Marke nach
        vorne stellen: <code>yoursite.com</code>. Schreib das auf deine Visitenkarte, in deine E-Mail-Signatur oder in
        deine Instagram-Bio, und der Eindruck, den du machst, spielt in einer anderen Liga. Die gute Nachricht: Eine
        Domain, die dir gehört, mit deinem BeyLink-Profil zu verbinden, dauert nur ein paar Minuten. Dieser Guide führt
        dich durch das Ganze.
      </P>

      <H2>Warum eine eigene Domain zählt</H2>
      <P>
        Eine Link-in-Bio-Seite ist im Grunde dein digitales Schaufenster, und die Adresse an der Tür gehört zu deiner
        Marke. Genau hier macht eine eigene Domain den Unterschied:
      </P>
      <UL>
        <li><strong>Markenvertrauen:</strong> Besucher finden eine Seite glaubwürdiger, wenn die Adresse deinen eigenen Namen trägt.</li>
        <li><strong>Einprägsamkeit:</strong> <code>yoursite.com</code> ist leicht zu sagen und leicht zu merken; niemand muss sich einen langen Benutzernamen einprägen.</li>
        <li><strong>Professioneller Auftritt:</strong> Für Unternehmen und ernsthafte Creator sendet die eigene Domain ein klares Signal: „Ich meine es ernst.“</li>
        <li><strong>Konsistenz:</strong> Deine Website, deine E-Mail und deine Link-Seite laufen alle unter einer Marke.</li>
      </UL>

      <H2>Was du vor dem Start brauchst</H2>
      <P>
        Zwei Dinge müssen vor der Einrichtung bereit sein:
      </P>
      <UL>
        <li><strong>Eine Domain, die dir gehört:</strong> BeyLink verkauft keine Domains. Wenn du bereits eine bei einem Registrar gekauft hast, bist du startklar. Falls nicht, kauf zuerst eine bei einem beliebigen Registrar und komm dann hierher zurück.</li>
        <li><strong>Der Pro-Plus-Tarif:</strong> Die eigene Domain ist ein Pro-Plus-Vorteil. Wenn du einen niedrigeren Tarif hast, musst du vor dem Verbinden upgraden.</li>
      </UL>

      <Callout tone="info" title="Der Domain-Kauf ist nicht enthalten">
        BeyLink verbindet nur eine Domain, die dir bereits gehört; die Domain selbst verkauft BeyLink nicht. Kauf deine
        Domain bei einem beliebigen Registrar deiner Wahl, etwa GoDaddy, Namecheap oder Cloudflare.
      </Callout>

      <H2>Wie die Verbindung funktioniert</H2>
      <P>
        Es sieht technisch aus, aber die Logik ist simpel: Deine Domain muss Besucher an den Server von BeyLink
        weiterleiten. Das machen wir mit ein paar DNS-Einträgen.
      </P>

      <H3>Ein A-Eintrag oder ein CNAME?</H3>
      <P>
        Das Panel zeigt dir zwei Optionen; nimm die, die dein DNS-Anbieter und dein Setup zulassen:
      </P>
      <UL>
        <li><strong>A-Eintrag:</strong> zeigt deine Root-Domain (Apex), zum Beispiel <code>yoursite.com</code>, direkt auf die Server-IP-Adresse von BeyLink. Root-Domains können technisch keinen CNAME nutzen, deshalb braucht eine Apex-Adresse wie <code>yoursite.com</code> den A-Eintrag.</li>
        <li><strong>CNAME-Eintrag:</strong> zeigt eine Subdomain, meist <code>www</code>, auf <code>cname.beylink.org</code>. Wenn du eine Subdomain nutzt, ist dieser Weg am einfachsten.</li>
      </UL>
      <P>
        Das Panel zeigt dir die exakten Werte für beide Einträge; du kopierst sie einfach und fügst sie bei deinem
        DNS-Anbieter ein.
      </P>

      <H3>Eigentum per TXT nachweisen (optional)</H3>
      <P>
        Für extra Sicherheit kannst du zusätzlich einen <strong>TXT-Eintrag</strong> hinzufügen:{' '}
        <code>_beylink-verify.yourdomain.com</code>. Dieser Eintrag belegt, dass die Domain wirklich dir gehört. Er ist
        nicht Pflicht, aber empfehlenswert.
      </P>

      <H3>Verifizierung und kostenloses HTTPS</H3>
      <P>
        Sobald deine Einträge stehen, tippst du im Panel auf den Button <strong>Verifizieren</strong>. Geht die
        DNS-Prüfung durch, wechselt deine Domain auf <strong>Aktiv</strong> und BeyLink stellt automatisch ein
        kostenloses SSL-Zertifikat (HTTPS) für dich aus. Du kümmerst dich nie um die Zertifikatsverwaltung; alles läuft
        im Hintergrund.
      </P>

      <Callout tone="warning" title="Die DNS-Verbreitung erfolgt nicht sofort">
        Einträge hinzugefügt, aber die Verifizierung ging beim ersten Versuch nicht durch? Keine Panik. Die
        DNS-Verbreitung kann zwischen ein paar Minuten und 48 Stunden dauern. Warte kurz und tippe dann erneut auf
        Verifizieren.
      </Callout>

      <P>
        Sobald deine Domain aktiv ist, landet jeder, der <code>yoursite.com</code> besucht, direkt auf deinem verbundenen
        Profil im Root-Pfad. Zugleich funktioniert deine Seite weiterhin auch über <code>beylink.org</code>; beide sind
        gleichzeitig gültig.
      </P>

      <InlineCta
        title="Verbinde deine eigene Domain"
        desc="Öffne im Pro-Plus-Panel den Bereich Eigene Domain, füge deine Domain hinzu, kopiere die DNS-Einträge und geh in wenigen Minuten live."
        href="/dashboard/domains"
        label="Zu Eigene Domain →"
      />

      <H2>Schritt-für-Schritt-Einrichtung</H2>
      <OL>
        <li>Geh im BeyLink-Panel in den Bereich <strong>Eigene Domain</strong>.</li>
        <li>Gib die Domain ein, die du verbinden willst (zum Beispiel <code>yoursite.com</code>).</li>
        <li><strong>Kopiere die DNS-Einträge</strong>, die dir das Panel zeigt: einen A-Eintrag oder einen CNAME (und einen TXT, wenn du magst).</li>
        <li>Geh in das Panel des Registrars oder DNS-Anbieters, bei dem du die Domain gekauft hast, und füge diese Einträge hinzu. Die Oberfläche unterscheidet sich je nach Anbieter (GoDaddy, Namecheap, Cloudflare und so weiter), aber die Logik ist überall gleich: Trag Eintragstyp, Name und Wert ein.</li>
        <li>Komm zurück zu BeyLink und klick auf den Button <strong>Verifizieren</strong>.</li>
        <li>Geht die Verifizierung durch, wird deine Domain Aktiv und HTTPS greift automatisch. Fertig.</li>
      </OL>

      <H2>Praktische Tipps</H2>
      <UL>
        <li><strong>Vorerst eine Domain:</strong> Du kannst eine eigene Domain pro Konto verbinden.</li>
        <li><strong>Nur Pro Plus:</strong> Diese Funktion ist nur im Pro-Plus-Tarif freigeschaltet. Auf einem niedrigeren Tarif upgrade zuerst.</li>
        <li><strong>Die Domain kaufst du:</strong> BeyLink verkauft keine Domains; kauf bei einem beliebigen Registrar und verbinde sie dann.</li>
        <li><strong>Wenn die Verifizierung scheitert, warte:</strong> Fast immer liegt es daran, dass die DNS-Verbreitung noch nicht abgeschlossen ist; versuch es etwas später erneut.</li>
      </UL>

      <H2>Fazit</H2>
      <P>
        Deine eigene Domain ist der letzte Schliff, der deine Link-Seite in eine echte Marke verwandelt. Die Einrichtung
        besteht nur aus ein paar DNS-Einträgen, HTTPS kommt automatisch, und danach läuft alles mit derselben
        BeyLink-Leichtigkeit, die du schon kennst.
      </P>
      <P>
        <A href="/register">Leg mit BeyLink los</A>, wechsle auf Pro Plus und verbinde <code>yoursite.com</code> noch
        heute mit deiner Seite.
      </P>
    </>
  );
}

function PostFr() {
  return (
    <>
      <P>
        <code>beylink.org/username</code> fait très bien l'affaire, mais à un moment vous voulez mettre votre propre
        marque en avant : <code>yoursite.com</code>. Inscrivez cela sur votre carte de visite, dans votre signature
        d'e-mail ou dans votre bio Instagram, et l'impression que vous laissez change complètement de catégorie. Bonne
        nouvelle : connecter un domaine que vous possédez à votre profil BeyLink ne prend que quelques minutes. Ce guide
        vous accompagne d'un bout à l'autre.
      </P>

      <H2>Pourquoi un domaine personnalisé compte</H2>
      <P>
        Une page link-in-bio est en réalité votre vitrine numérique, et l'adresse sur la porte fait partie de votre
        marque. Voici là où un domaine personnalisé fait la différence :
      </P>
      <UL>
        <li><strong>Confiance dans la marque :</strong> les visiteurs trouvent une page plus crédible lorsque l'adresse porte votre propre nom.</li>
        <li><strong>Mémorisation :</strong> <code>yoursite.com</code> est facile à dire et facile à retenir ; personne n'a à mémoriser un long nom d'utilisateur.</li>
        <li><strong>Une allure professionnelle :</strong> pour les entreprises et les créateurs sérieux, votre propre domaine envoie un signal clair : « je prends cela au sérieux ».</li>
        <li><strong>Cohérence :</strong> votre site web, votre e-mail et votre page de liens vivent tous sous une seule marque.</li>
      </UL>

      <H2>Ce qu'il vous faut avant de commencer</H2>
      <P>
        Deux choses doivent être en place avant la configuration :
      </P>
      <UL>
        <li><strong>Un domaine qui vous appartient :</strong> BeyLink ne vend pas de domaines. Si vous en avez déjà acheté un chez un registrar, vous êtes prêt. Sinon, achetez-en un chez le registrar de votre choix, puis revenez ici.</li>
        <li><strong>Le forfait Pro Plus :</strong> le domaine personnalisé est réservé à Pro Plus. Si vous êtes sur un forfait inférieur, vous devrez passer à la version supérieure avant de connecter.</li>
      </UL>

      <Callout tone="info" title="L'achat du domaine n'est pas inclus">
        BeyLink connecte uniquement un domaine que vous possédez déjà ; il ne vend pas le domaine lui-même. Achetez votre
        domaine chez le registrar de votre choix, comme GoDaddy, Namecheap ou Cloudflare.
      </Callout>

      <H2>Comment fonctionne la connexion</H2>
      <P>
        Cela paraît technique, mais la logique est simple : votre domaine doit diriger les visiteurs vers le serveur de
        BeyLink. Nous faisons cela avec quelques enregistrements DNS.
      </P>

      <H3>Un enregistrement A ou un CNAME ?</H3>
      <P>
        Le panneau vous propose deux options ; choisissez celle que votre fournisseur DNS et votre configuration
        autorisent :
      </P>
      <UL>
        <li><strong>Enregistrement A :</strong> pointe votre domaine racine (apex), par exemple <code>yoursite.com</code>, directement vers l'adresse IP du serveur de BeyLink. Les domaines racine ne peuvent techniquement pas utiliser de CNAME, donc une adresse apex comme <code>yoursite.com</code> a besoin de l'enregistrement A.</li>
        <li><strong>Enregistrement CNAME :</strong> pointe un sous-domaine, généralement <code>www</code>, vers <code>cname.beylink.org</code>. Si vous utilisez un sous-domaine, c'est la voie la plus simple.</li>
      </UL>
      <P>
        Le panneau affiche les valeurs exactes des deux enregistrements ; il vous suffit de les copier et de les coller
        chez votre fournisseur DNS.
      </P>

      <H3>Prouver la propriété avec un TXT (facultatif)</H3>
      <P>
        Pour plus de sécurité, vous pouvez aussi ajouter un <strong>enregistrement TXT</strong> :{' '}
        <code>_beylink-verify.yourdomain.com</code>. Cet enregistrement prouve que le domaine vous appartient vraiment.
        Il n'est pas obligatoire, mais il est recommandé.
      </P>

      <H3>Vérification et HTTPS gratuit</H3>
      <P>
        Une fois vos enregistrements en place, vous appuyez sur le bouton <strong>Vérifier</strong> dans le panneau.
        Lorsque la vérification DNS passe, votre domaine bascule sur <strong>Actif</strong> et BeyLink émet
        automatiquement un certificat SSL gratuit (HTTPS) pour vous. Vous ne touchez jamais à la gestion des
        certificats ; tout est pris en charge en coulisses.
      </P>

      <Callout tone="warning" title="La propagation DNS n'est pas instantanée">
        Vous avez ajouté les enregistrements mais la vérification n'est pas passée du premier coup ? Pas de panique. La
        propagation DNS peut prendre de quelques minutes à 48 heures. Patientez un peu, puis appuyez de nouveau sur
        Vérifier.
      </Callout>

      <P>
        Une fois votre domaine actif, toute personne qui visite <code>yoursite.com</code> arrive directement sur votre
        profil connecté, à la racine. Pendant ce temps, votre page continue aussi de fonctionner sur{' '}
        <code>beylink.org</code> ; les deux sont valides en même temps.
      </P>

      <InlineCta
        title="Connectez votre propre domaine"
        desc="Dans le panneau Pro Plus, ouvrez Domaine personnalisé, ajoutez votre domaine, copiez les enregistrements DNS et mettez-le en ligne en quelques minutes."
        href="/dashboard/domains"
        label="Aller à Domaine personnalisé →"
      />

      <H2>Configuration pas à pas</H2>
      <OL>
        <li>Dans le panneau BeyLink, allez dans la section <strong>Domaine personnalisé</strong>.</li>
        <li>Saisissez le domaine que vous voulez connecter (par exemple <code>yoursite.com</code>).</li>
        <li><strong>Copiez les enregistrements DNS</strong> que le panneau vous affiche : un enregistrement A ou un CNAME (et un TXT si vous le souhaitez).</li>
        <li>Rendez-vous dans le panneau du registrar ou du fournisseur DNS où vous avez acheté le domaine, et ajoutez ces enregistrements. L'interface varie selon le fournisseur (GoDaddy, Namecheap, Cloudflare, etc.), mais la logique est la même partout : indiquez le type d'enregistrement, le nom et la valeur.</li>
        <li>Revenez sur BeyLink et cliquez sur le bouton <strong>Vérifier</strong>.</li>
        <li>Quand la vérification passe, votre domaine devient Actif et le HTTPS s'active automatiquement. C'est terminé.</li>
      </OL>

      <H2>Conseils pratiques</H2>
      <UL>
        <li><strong>Un domaine pour l'instant :</strong> vous pouvez connecter un domaine personnalisé par compte.</li>
        <li><strong>Pro Plus uniquement :</strong> cette fonctionnalité n'est débloquée que sur le forfait Pro Plus. Sur un forfait inférieur, passez d'abord à la version supérieure.</li>
        <li><strong>C'est vous qui achetez le domaine :</strong> BeyLink ne vend pas de domaines ; achetez chez le registrar de votre choix, puis connectez.</li>
        <li><strong>Si la vérification échoue, patientez :</strong> presque toujours, la cause est que la propagation DNS n'est pas encore terminée ; réessayez un peu plus tard.</li>
      </UL>

      <H2>Conclusion</H2>
      <P>
        Votre propre domaine est la touche finale qui transforme votre page de liens en véritable marque. La
        configuration se résume à quelques enregistrements DNS, le HTTPS arrive automatiquement, et ensuite tout
        fonctionne avec la même simplicité BeyLink que vous connaissez déjà.
      </P>
      <P>
        <A href="/register">Lancez-vous avec BeyLink</A>, passez à Pro Plus et connectez <code>yoursite.com</code> à
        votre page dès aujourd'hui.
      </P>
    </>
  );
}

function PostPt() {
  return (
    <>
      <P>
        <code>beylink.org/username</code> cumpre bem o seu papel, mas em algum momento você quer colocar a sua própria
        marca na frente: <code>yoursite.com</code>. Coloque isso no seu cartão de visita, na assinatura do seu e-mail ou
        na bio do Instagram, e a impressão que você causa fica em outro nível. A boa notícia: conectar um domínio que é
        seu ao perfil BeyLink leva só alguns minutos. Este guia acompanha você do começo ao fim.
      </P>

      <H2>Por que um domínio próprio importa</H2>
      <P>
        Uma página link-in-bio é, na prática, a sua vitrine digital, e o endereço na porta faz parte da sua marca. É
        aqui que um domínio próprio faz diferença:
      </P>
      <UL>
        <li><strong>Confiança na marca:</strong> os visitantes acham uma página mais confiável quando o endereço leva o seu próprio nome.</li>
        <li><strong>Fácil de lembrar:</strong> <code>yoursite.com</code> é fácil de falar e fácil de memorizar; ninguém precisa decorar um nome de usuário longo.</li>
        <li><strong>Ar profissional:</strong> para empresas e criadores sérios, o seu próprio domínio manda um recado claro de "levo isso a sério".</li>
        <li><strong>Consistência:</strong> o seu site, o seu e-mail e a sua página de links vivem todos sob uma só marca.</li>
      </UL>

      <H2>O que você precisa antes de começar</H2>
      <P>
        Duas coisas precisam estar prontas antes da configuração:
      </P>
      <UL>
        <li><strong>Um domínio que é seu:</strong> o BeyLink não vende domínios. Se você já comprou um em um registrador, está pronto. Se não, compre um em qualquer registrador primeiro e depois volte aqui.</li>
        <li><strong>O plano Pro Plus:</strong> o domínio próprio é exclusivo do Pro Plus. Se você está em um plano inferior, vai precisar fazer o upgrade antes de conectar.</li>
      </UL>

      <Callout tone="info" title="A compra do domínio não está incluída">
        O BeyLink só conecta um domínio que já é seu; ele não vende o domínio em si. Compre o seu domínio em qualquer
        registrador que preferir, como GoDaddy, Namecheap ou Cloudflare.
      </Callout>

      <H2>Como a conexão funciona</H2>
      <P>
        Parece técnico, mas a lógica é simples: o seu domínio precisa direcionar os visitantes para o servidor do
        BeyLink. Fazemos isso com alguns registros DNS.
      </P>

      <H3>Um registro A ou um CNAME?</H3>
      <P>
        O painel mostra duas opções; escolha a que o seu provedor de DNS e a sua configuração permitirem:
      </P>
      <UL>
        <li><strong>Registro A:</strong> aponta o seu domínio raiz (apex), por exemplo <code>yoursite.com</code>, direto para o endereço IP do servidor do BeyLink. Domínios raiz tecnicamente não podem usar um CNAME, então um endereço apex como <code>yoursite.com</code> precisa do registro A.</li>
        <li><strong>Registro CNAME:</strong> aponta um subdomínio, normalmente <code>www</code>, para <code>cname.beylink.org</code>. Se você vai usar um subdomínio, esse caminho é o mais fácil.</li>
      </UL>
      <P>
        O painel mostra os valores exatos dos dois registros; você só copia e cola no seu provedor de DNS.
      </P>

      <H3>Comprove a posse com TXT (opcional)</H3>
      <P>
        Para mais segurança, você também pode adicionar um <strong>registro TXT</strong>:{' '}
        <code>_beylink-verify.yourdomain.com</code>. Esse registro comprova que o domínio realmente é seu. Não é
        obrigatório, mas é recomendado.
      </P>

      <H3>Verificação e HTTPS grátis</H3>
      <P>
        Assim que os seus registros estão no lugar, você toca no botão <strong>Verificar</strong> no painel. Quando a
        checagem de DNS passa, o seu domínio muda para <strong>Ativo</strong> e o BeyLink emite automaticamente um
        certificado SSL gratuito (HTTPS) para você. Você nunca mexe na gestão de certificados; tudo é cuidado nos
        bastidores.
      </P>

      <Callout tone="warning" title="A propagação do DNS não é instantânea">
        Adicionou os registros mas a verificação não passou na primeira tentativa? Sem pânico. A propagação do DNS pode
        levar de alguns minutos até 48 horas. Espere um pouco e toque em Verificar de novo.
      </Callout>

      <P>
        Quando o seu domínio está ativo, qualquer pessoa que visitar <code>yoursite.com</code> cai direto no seu perfil
        conectado, no caminho raiz. Enquanto isso, a sua página continua funcionando também no <code>beylink.org</code>;
        os dois são válidos ao mesmo tempo.
      </P>

      <InlineCta
        title="Conecte o seu próprio domínio"
        desc="No painel Pro Plus, abra Domínio Próprio, adicione o seu domínio, copie os registros DNS e coloque no ar em minutos."
        href="/dashboard/domains"
        label="Ir para Domínio Próprio →"
      />

      <H2>Configuração passo a passo</H2>
      <OL>
        <li>No painel do BeyLink, vá até a seção <strong>Domínio Próprio</strong>.</li>
        <li>Digite o domínio que você quer conectar (por exemplo <code>yoursite.com</code>).</li>
        <li><strong>Copie os registros DNS</strong> que o painel mostra: um registro A ou um CNAME (e um TXT, se quiser).</li>
        <li>Vá até o painel do registrador ou do provedor de DNS onde você comprou o domínio e adicione esses registros. A interface muda conforme o provedor (GoDaddy, Namecheap, Cloudflare e por aí vai), mas a lógica é a mesma em todo lugar: informe o tipo do registro, o nome e o valor.</li>
        <li>Volte ao BeyLink e clique no botão <strong>Verificar</strong>.</li>
        <li>Quando a verificação passa, o seu domínio fica Ativo e o HTTPS entra automaticamente. Pronto.</li>
      </OL>

      <H2>Dicas práticas</H2>
      <UL>
        <li><strong>Um domínio por enquanto:</strong> você pode conectar um domínio próprio por conta.</li>
        <li><strong>Só no Pro Plus:</strong> esse recurso é liberado apenas no plano Pro Plus. Em um plano inferior, faça o upgrade primeiro.</li>
        <li><strong>Você compra o domínio:</strong> o BeyLink não vende domínios; compre em qualquer registrador e depois conecte.</li>
        <li><strong>Se a verificação falhar, espere:</strong> quase sempre o motivo é a propagação do DNS ainda não ter terminado; tente de novo um pouco mais tarde.</li>
      </UL>

      <H2>Conclusão</H2>
      <P>
        O seu próprio domínio é o toque final que transforma a sua página de links em uma marca de verdade. A
        configuração é só um par de registros DNS, o HTTPS vem automaticamente e, a partir daí, tudo roda com a mesma
        facilidade do BeyLink que você já conhece.
      </P>
      <P>
        <A href="/register">Comece com o BeyLink</A>, passe para o Pro Plus e conecte <code>yoursite.com</code> à sua
        página hoje mesmo.
      </P>
    </>
  );
}

function PostIt() {
  return (
    <>
      <P>
        <code>beylink.org/username</code> fa il suo lavoro senza problemi, ma a un certo punto vuoi mettere in primo
        piano il tuo brand: <code>yoursite.com</code>. Mettilo sul biglietto da visita, nella firma delle e-mail o nella
        bio di Instagram, e l'impressione che lasci è tutta un'altra storia. La buona notizia: collegare un dominio che
        possiedi al tuo profilo BeyLink richiede solo pochi minuti. Questa guida ti accompagna dall'inizio alla fine.
      </P>

      <H2>Perché un dominio personalizzato conta</H2>
      <P>
        Una pagina link-in-bio è in fondo la tua vetrina digitale, e l'indirizzo sulla porta fa parte del tuo brand.
        Ecco dove un dominio personalizzato fa la differenza:
      </P>
      <UL>
        <li><strong>Fiducia nel brand:</strong> i visitatori trovano una pagina più credibile quando l'indirizzo porta il tuo nome.</li>
        <li><strong>Facile da ricordare:</strong> <code>yoursite.com</code> è facile da dire e da memorizzare; nessuno deve imparare a memoria un nome utente lungo.</li>
        <li><strong>Un tocco professionale:</strong> per aziende e creator seri, il tuo dominio manda un segnale chiaro: "faccio le cose sul serio".</li>
        <li><strong>Coerenza:</strong> il tuo sito, la tua e-mail e la tua pagina di link vivono tutti sotto un unico brand.</li>
      </UL>

      <H2>Cosa ti serve prima di iniziare</H2>
      <P>
        Due cose devono essere pronte prima della configurazione:
      </P>
      <UL>
        <li><strong>Un dominio che possiedi:</strong> BeyLink non vende domini. Se ne hai già comprato uno da un registrar, sei pronto. Altrimenti, comprane prima uno da un registrar qualsiasi, poi torna qui.</li>
        <li><strong>Il piano Pro Plus:</strong> il dominio personalizzato è un'esclusiva di Pro Plus. Se sei su un piano inferiore, dovrai fare l'upgrade prima di collegarlo.</li>
      </UL>

      <Callout tone="info" title="L'acquisto del dominio non è incluso">
        BeyLink collega soltanto un dominio che possiedi già; non vende il dominio in sé. Compra il tuo dominio dal
        registrar che preferisci, come GoDaddy, Namecheap o Cloudflare.
      </Callout>

      <H2>Come funziona il collegamento</H2>
      <P>
        Sembra tecnico, ma la logica è semplice: il tuo dominio deve indirizzare i visitatori al server di BeyLink. Lo
        facciamo con un paio di record DNS.
      </P>

      <H3>Un record A o un CNAME?</H3>
      <P>
        Il pannello ti mostra due opzioni; scegli quella che il tuo provider DNS e la tua configurazione consentono:
      </P>
      <UL>
        <li><strong>Record A:</strong> punta il tuo dominio radice (apex), per esempio <code>yoursite.com</code>, direttamente all'indirizzo IP del server di BeyLink. I domini radice tecnicamente non possono usare un CNAME, quindi un indirizzo apex come <code>yoursite.com</code> richiede il record A.</li>
        <li><strong>Record CNAME:</strong> punta un sottodominio, di solito <code>www</code>, a <code>cname.beylink.org</code>. Se usi un sottodominio, questa è la strada più semplice.</li>
      </UL>
      <P>
        Il pannello mostra i valori esatti di entrambi i record; a te basta copiarli e incollarli nel tuo provider DNS.
      </P>

      <H3>Dimostra la proprietà con un TXT (facoltativo)</H3>
      <P>
        Per maggiore sicurezza puoi anche aggiungere un <strong>record TXT</strong>:{' '}
        <code>_beylink-verify.yourdomain.com</code>. Questo record dimostra che il dominio è davvero tuo. Non è
        obbligatorio, ma è consigliato.
      </P>

      <H3>Verifica e HTTPS gratuito</H3>
      <P>
        Una volta inseriti i record, premi il pulsante <strong>Verifica</strong> nel pannello. Quando il controllo DNS
        passa, il tuo dominio diventa <strong>Attivo</strong> e BeyLink emette in automatico un certificato SSL gratuito
        (HTTPS) per te. Non tocchi mai la gestione dei certificati; è tutto gestito dietro le quinte.
      </P>

      <Callout tone="warning" title="La propagazione DNS non è istantanea">
        Hai aggiunto i record ma la verifica non è passata al primo tentativo? Niente panico. La propagazione DNS può
        richiedere da pochi minuti fino a 48 ore. Aspetta un po', poi premi di nuovo Verifica.
      </Callout>

      <P>
        Quando il tuo dominio è attivo, chiunque visiti <code>yoursite.com</code> arriva direttamente sul profilo
        collegato, sul percorso radice. Nel frattempo la tua pagina continua a funzionare anche su{' '}
        <code>beylink.org</code>; entrambi sono validi contemporaneamente.
      </P>

      <InlineCta
        title="Collega il tuo dominio"
        desc="Nel pannello Pro Plus apri Dominio personalizzato, aggiungi il tuo dominio, copia i record DNS e vai online in pochi minuti."
        href="/dashboard/domains"
        label="Vai a Dominio personalizzato →"
      />

      <H2>Configurazione passo dopo passo</H2>
      <OL>
        <li>Nel pannello BeyLink, vai alla sezione <strong>Dominio personalizzato</strong>.</li>
        <li>Inserisci il dominio che vuoi collegare (per esempio <code>yoursite.com</code>).</li>
        <li><strong>Copia i record DNS</strong> che il pannello ti mostra: un record A o un CNAME (e un TXT, se vuoi).</li>
        <li>Vai al pannello del registrar o del provider DNS dove hai comprato il dominio e aggiungi quei record. L'interfaccia cambia da provider a provider (GoDaddy, Namecheap, Cloudflare e così via), ma la logica è la stessa ovunque: inserisci il tipo di record, il nome e il valore.</li>
        <li>Torna su BeyLink e clicca sul pulsante <strong>Verifica</strong>.</li>
        <li>Quando la verifica passa, il tuo dominio diventa Attivo e l'HTTPS si attiva in automatico. Fatto.</li>
      </OL>

      <H2>Consigli pratici</H2>
      <UL>
        <li><strong>Un dominio per ora:</strong> puoi collegare un dominio personalizzato per account.</li>
        <li><strong>Solo Pro Plus:</strong> questa funzione è sbloccata solo sul piano Pro Plus. Su un piano inferiore, fai prima l'upgrade.</li>
        <li><strong>Il dominio lo compri tu:</strong> BeyLink non vende domini; compralo dal registrar che preferisci, poi collegalo.</li>
        <li><strong>Se la verifica fallisce, aspetta:</strong> quasi sempre la causa è che la propagazione DNS non è ancora finita; riprova un po' più tardi.</li>
      </UL>

      <H2>Conclusione</H2>
      <P>
        Il tuo dominio è il tocco finale che trasforma la tua pagina di link in un vero brand. La configurazione è solo
        un paio di record DNS, l'HTTPS arriva in automatico e da lì in poi tutto funziona con la stessa semplicità
        BeyLink che conosci già.
      </P>
      <P>
        <A href="/register">Inizia con BeyLink</A>, passa a Pro Plus e collega <code>yoursite.com</code> alla tua pagina
        oggi stesso.
      </P>
    </>
  );
}

function PostJa() {
  return (
    <>
      <P>
        <code>beylink.org/username</code> でも十分に役目は果たしますが、あるタイミングで、自分のブランドを前面に出したくなります。{' '}
        <code>yoursite.com</code> です。これを名刺やメールの署名、Instagramのプロフィールに載せると、与える印象はまるで別物になります。
        うれしいことに、自分が持っているドメインをBeyLinkプロフィールにつなぐ作業は、ほんの数分で終わります。このガイドで、最初から最後まで手順を追っていきます。
      </P>

      <H2>なぜ独自ドメインが大事なのか</H2>
      <P>
        リンクインバイオのページは、いわばあなたのデジタルな店構えであり、その入り口の住所もブランドの一部です。独自ドメインが効いてくるのは、次のような場面です。
      </P>
      <UL>
        <li><strong>ブランドの信頼感：</strong>住所に自分の名前が入っていると、訪問者はそのページをより信頼できると感じます。</li>
        <li><strong>覚えやすさ：</strong><code>yoursite.com</code> は口に出しやすく、覚えやすい。長いユーザーネームを暗記してもらう必要はありません。</li>
        <li><strong>プロらしさ：</strong>企業や本気のクリエイターにとって、独自ドメインは「これを本気でやっている」という明確なサインになります。</li>
        <li><strong>一貫性：</strong>Webサイト、メール、リンクページが、すべて1つのブランドのもとにまとまります。</li>
      </UL>

      <H2>始める前に必要なもの</H2>
      <P>
        設定を始める前に、2つのものを用意しておく必要があります。
      </P>
      <UL>
        <li><strong>自分が持っているドメイン：</strong>BeyLinkはドメインを販売していません。すでにレジストラで購入済みなら、準備は完了です。まだなら、まずお好きなレジストラで1つ購入してから、ここに戻ってきてください。</li>
        <li><strong>Pro Plusプラン：</strong>独自ドメインはPro Plus限定の機能です。それより下のプランをお使いなら、つなぐ前にアップグレードが必要です。</li>
      </UL>

      <Callout tone="info" title="ドメインの購入は含まれません">
        BeyLinkがつなぐのは、あなたがすでに持っているドメインだけで、ドメインそのものは販売していません。ドメインはGoDaddy、Namecheap、Cloudflareなど、
        お好きなレジストラで購入してください。
      </Callout>

      <H2>連携のしくみ</H2>
      <P>
        技術的に見えますが、理屈はシンプルです。あなたのドメインが、訪問者をBeyLinkのサーバーに向ける必要がある、それだけです。これを、いくつかのDNSレコードで行います。
      </P>

      <H3>AレコードとCNAME、どちら？</H3>
      <P>
        パネルには2つの選択肢が表示されます。DNSプロバイダーと設定が許すほうを選んでください。
      </P>
      <UL>
        <li><strong>Aレコード：</strong>ルート（apex）ドメイン、たとえば <code>yoursite.com</code> を、BeyLinkのサーバーのIPアドレスへ直接向けます。ルートドメインは技術的にCNAMEを使えないため、<code>yoursite.com</code> のようなapexアドレスにはAレコードが必要です。</li>
        <li><strong>CNAMEレコード：</strong>サブドメイン、通常は <code>www</code> を、<code>cname.beylink.org</code> へ向けます。サブドメインを使うなら、こちらの方法がいちばん手軽です。</li>
      </UL>
      <P>
        パネルには両方のレコードの正確な値が表示されます。あなたはそれをコピーして、DNSプロバイダーに貼り付けるだけです。
      </P>

      <H3>TXTで所有権を証明する（任意）</H3>
      <P>
        さらに安全にするため、<strong>TXTレコード</strong>を追加することもできます。{' '}
        <code>_beylink-verify.yourdomain.com</code> です。このレコードは、そのドメインが本当にあなたのものであることを証明します。必須ではありませんが、おすすめです。
      </P>

      <H3>認証と無料のHTTPS</H3>
      <P>
        レコードを設定したら、パネルの<strong>認証</strong>ボタンを押します。DNSチェックが通ると、あなたのドメインは<strong>有効</strong>に切り替わり、
        BeyLinkが自動で無料のSSL証明書（HTTPS）を発行します。証明書の管理に手を触れることは一切なく、すべて裏側で処理されます。
      </P>

      <Callout tone="warning" title="DNSの伝播は瞬時ではありません">
        レコードを追加したのに、最初の試行で認証が通らなかった？あわてないでください。DNSの伝播は、数分から48時間ほどかかることがあります。
        少し待ってから、もう一度「認証」を押してください。
      </Callout>

      <P>
        ドメインが有効になると、<code>yoursite.com</code> を訪れた人は、ルートのパスで、そのまま連携済みのプロフィールにたどり着きます。その間も、あなたのページは{' '}
        <code>beylink.org</code> でも動き続けます。両方が同時に有効です。
      </P>

      <InlineCta
        title="自分のドメインをつなぐ"
        desc="Pro Plusのパネルで「独自ドメイン」を開き、ドメインを追加し、DNSレコードをコピーすれば、数分で公開できます。"
        href="/dashboard/domains"
        label="独自ドメインへ →"
      />

      <H2>ステップ・バイ・ステップの設定</H2>
      <OL>
        <li>BeyLinkのパネルで<strong>独自ドメイン</strong>のセクションに移動する。</li>
        <li>つなぎたいドメインを入力する（たとえば <code>yoursite.com</code>）。</li>
        <li>パネルに表示される<strong>DNSレコードをコピーする</strong>。AレコードまたはCNAME（必要ならTXTも）。</li>
        <li>ドメインを購入したレジストラまたはDNSプロバイダーのパネルに行き、そのレコードを追加する。画面はプロバイダーによって異なります（GoDaddy、Namecheap、Cloudflareなど）が、理屈はどこでも同じです。レコードの種類、名前、値を入力します。</li>
        <li>BeyLinkに戻り、<strong>認証</strong>ボタンをクリックする。</li>
        <li>認証が通れば、ドメインは有効になり、HTTPSが自動で有効化されます。これで完了です。</li>
      </OL>

      <H2>実践的なヒント</H2>
      <UL>
        <li><strong>今のところドメインは1つ：</strong>1アカウントにつき独自ドメインを1つつなげます。</li>
        <li><strong>Pro Plus限定：</strong>この機能はPro Plusプランでのみ開放されます。下のプランなら、先にアップグレードを。</li>
        <li><strong>ドメインは自分で買う：</strong>BeyLinkはドメインを販売していません。お好きなレジストラで購入してから、つないでください。</li>
        <li><strong>認証が通らなければ待つ：</strong>ほとんどの場合、原因はDNSの伝播がまだ終わっていないことです。少し時間をおいて、もう一度試してください。</li>
      </UL>

      <H2>まとめ</H2>
      <P>
        自分のドメインは、リンクページを本物のブランドへと変える、最後のひと押しです。設定はDNSレコードをいくつか入れるだけ、HTTPSは自動でついてきて、
        あとはすべて、あなたがすでに知っているBeyLinkの手軽さで動きます。
      </P>
      <P>
        <A href="/register">BeyLinkで始めて</A>、Pro Plusに切り替え、<code>yoursite.com</code> を今日、自分のページにつないでみましょう。
      </P>
    </>
  );
}

export default function Post() {
  const { lang } = useLanguage();
  return lang === 'ja' ? <PostJa /> : lang === 'it' ? <PostIt /> : lang === 'pt' ? <PostPt /> : lang === 'fr' ? <PostFr /> : lang === 'de' ? <PostDe /> : lang === 'ru' ? <PostRu /> : lang === 'es' ? <PostEs /> : lang === 'en' ? <PostEn /> : <PostTr />;
}
