import { H2, H3, P, UL, OL, A, Callout, InlineCta } from '../PostBody.jsx';
import { useLanguage } from '../../../context/LanguageContext.jsx';

export const meta = {
  slug: 'instagram-bio-optimization',
  title: {
    tr: 'Instagram Bio Optimizasyonu: Takipçiyi Müşteriye Çeviren 10 Kural',
    en: 'Instagram Bio Optimization: 10 Rules That Convert',
    ru: 'Оптимизация Instagram-био: 10 правил конверсии',
    es: 'Optimización de la bio de Instagram: 10 reglas',
    de: 'Instagram-Bio optimieren: 10 Regeln, die konvertieren',
    fr: 'Optimiser sa bio Instagram : 10 règles qui convertissent',
    pt: 'Otimização da bio do Instagram: 10 regras que convertem',
    it: 'Bio Instagram: 10 regole che convertono davvero',
    ja: 'Instagramプロフィール最適化：成果を生む10の法則',
  },
  description: {
    tr: 'Instagram biyografini profesyonel yap: takipçi çekecek başlık formülleri, biolink stratejisi, emoji kullanımı ve dönüşüm için ipuçları.',
    en: 'Make your Instagram bio work harder: headline formulas that pull followers, a bio link strategy, smart emoji use, and tips that drive conversions.',
    ru: 'Заставьте своё Instagram-био работать: формулы заголовков, стратегия ссылки в био, умные эмодзи и приёмы, повышающие конверсию.',
    es: 'Haz que tu bio de Instagram trabaje más: fórmulas de titulares que atraen seguidores, estrategia de link in bio, emojis y trucos que convierten.',
    de: 'Hol mehr aus deiner Instagram-Bio: Titel-Formeln, die Follower ziehen, eine Bio-Link-Strategie, cleverer Emoji-Einsatz und Tipps, die konvertieren.',
    fr: 'Faites travailler votre bio Instagram : formules de titres qui attirent des abonnés, stratégie de lien en bio, emojis malins et astuces qui convertissent.',
    pt: 'Faça sua bio do Instagram render mais: fórmulas de título que atraem seguidores, estratégia de link na bio, uso esperto de emojis e dicas que convertem.',
    it: 'Fai rendere di più la tua bio Instagram: formule di titolo che attirano follower, strategia di link in bio, emoji smart e trucchi che convertono.',
    ja: 'Instagramのプロフィールをもっと働かせよう。フォロワーを引き寄せる見出しの型、プロフィールリンク戦略、賢い絵文字の使い方、コンバージョンを高めるコツを紹介します。',
  },
  category: 'sosyal-medya',
  tags: {
    tr: ['instagram', 'bio', 'takipçi', 'dönüşüm'],
    en: ['instagram', 'bio', 'followers', 'conversion'],
    ru: ['instagram', 'био', 'подписчики', 'конверсия'],
    es: ['instagram', 'bio', 'seguidores', 'conversión'],
    de: ['instagram', 'bio', 'follower', 'conversion'],
    fr: ['instagram', 'bio', 'abonnés', 'conversion'],
    pt: ['instagram', 'bio', 'seguidores', 'conversão'],
    it: ['instagram', 'bio', 'follower', 'conversione'],
    ja: ['instagram', 'プロフィール', 'フォロワー', 'コンバージョン'],
  },
  publishedAt: '2026-07-07',
  updatedAt: '2026-07-07',
  readingMinutes: 8,
  image: '/og-image.png',
  faq: {
    tr: [
      { q: 'Instagram bio\'da kaç karakter var?', a: 'Instagram biyografi alanı en fazla 150 karakter destekler. Bu kısıtlama içinde açık, çekici ve harekete geçirici bir metin yazman gerekir.' },
      { q: 'Bio\'ya link koyabilir miyim?', a: 'Evet, tam olarak 1 tıklanabilir link koyabilirsin. Bu yüzden link-in-bio hizmetleri (BeyLink gibi) tüm bağlantılarını tek bir sayfada toplaman için idealdir.' },
      { q: 'Emoji kullanmalı mıyım?', a: 'Evet, ölçülü kullanıldığında görsel dikkat çeker ve okumayı kolaylaştırır. Ama 3-5 emoji ideal; abartılı emoji spam gibi görünür.' },
      { q: 'Bio\'yu ne sıklıkla değiştirmeliyim?', a: 'Yeni bir kampanya, ürün ya da içerik olduğunda güncellemek iyi bir alışkanlıktır. Sabit bio takipçileri bilgilendirmez.' },
    ],
    en: [
      { q: 'How many characters can an Instagram bio have?', a: 'Instagram bios support up to 150 characters. Within that limit, you need copy that is clear, compelling, and action-driven.' },
      { q: 'Can I put a link in my bio?', a: 'Yes, exactly one clickable link. That is why link-in-bio services like BeyLink are ideal for gathering all of your destinations onto a single page.' },
      { q: 'Should I use emojis?', a: 'Yes. Used in moderation, they catch the eye and make your bio easier to scan. Three to five emojis is ideal; overdo it and it starts to look like spam.' },
      { q: 'How often should I update my bio?', a: 'Refreshing it whenever you have a new campaign, product, or piece of content is a great habit. A static bio never tells followers anything new.' },
    ],
    ru: [
      { q: 'Сколько символов в Instagram-био?', a: 'Instagram-био поддерживает до 150 символов. В этих рамках нужен текст, который ясен, цепляет и подталкивает к действию.' },
      { q: 'Можно ли поставить ссылку в био?', a: 'Да, ровно одну кликабельную ссылку. Именно поэтому сервисы ссылки в био, такие как BeyLink, идеально подходят, чтобы собрать все ваши адреса на одной странице.' },
      { q: 'Стоит ли использовать эмодзи?', a: 'Да. В меру они цепляют взгляд и облегчают чтение био. Три-пять эмодзи это оптимально; переборщите, и это начнёт выглядеть как спам.' },
      { q: 'Как часто обновлять био?', a: 'Обновлять его при каждой новой кампании, товаре или контенте это отличная привычка. Статичное био не сообщает подписчикам ничего нового.' },
    ],
    es: [
      { q: '¿Cuántos caracteres admite la bio de Instagram?', a: 'La biografía de Instagram admite hasta 150 caracteres. Dentro de ese límite necesitas un texto claro, atractivo y orientado a la acción.' },
      { q: '¿Puedo poner un enlace en la bio?', a: 'Sí, exactamente un enlace clicable. Por eso los servicios de link in bio como BeyLink son ideales para reunir todos tus destinos en una sola página.' },
      { q: '¿Debería usar emojis?', a: 'Sí. Usados con moderación, llaman la atención y hacen tu bio más fácil de leer. Entre tres y cinco emojis es lo ideal; si te pasas, empieza a parecer spam.' },
      { q: '¿Con qué frecuencia debo actualizar la bio?', a: 'Refrescarla cada vez que tienes una campaña, un producto o un contenido nuevo es un gran hábito. Una bio estática nunca cuenta nada nuevo a tus seguidores.' },
    ],
    de: [
      { q: 'Wie viele Zeichen darf eine Instagram-Bio haben?', a: 'Instagram-Bios erlauben bis zu 150 Zeichen. Innerhalb dieser Grenze brauchst du einen Text, der klar, überzeugend und handlungsorientiert ist.' },
      { q: 'Kann ich einen Link in meine Bio setzen?', a: 'Ja, genau einen klickbaren Link. Deshalb sind Link-in-Bio-Dienste wie BeyLink ideal, um all deine Ziele auf einer einzigen Seite zu bündeln.' },
      { q: 'Sollte ich Emojis verwenden?', a: 'Ja. In Maßen eingesetzt ziehen sie den Blick auf sich und machen deine Bio leichter überfliegbar. Drei bis fünf Emojis sind ideal; übertreibst du, sieht es schnell nach Spam aus.' },
      { q: 'Wie oft sollte ich meine Bio aktualisieren?', a: 'Sie bei jeder neuen Kampagne, jedem neuen Produkt oder Content aufzufrischen ist eine gute Gewohnheit. Eine statische Bio erzählt deinen Followern nie etwas Neues.' },
    ],
    fr: [
      { q: 'Combien de caractères une bio Instagram peut-elle contenir ?', a: 'La bio Instagram accepte jusqu\'à 150 caractères. Dans cette limite, il vous faut un texte clair, percutant et orienté vers l\'action.' },
      { q: 'Puis-je mettre un lien dans ma bio ?', a: 'Oui, exactement un lien cliquable. C\'est pour cela que les services de lien en bio comme BeyLink sont parfaits pour rassembler toutes vos destinations sur une seule page.' },
      { q: 'Dois-je utiliser des emojis ?', a: 'Oui. Utilisés avec modération, ils attirent l\'œil et rendent votre bio plus facile à parcourir. Trois à cinq emojis, c\'est l\'idéal ; en abuser finit par ressembler à du spam.' },
      { q: 'À quelle fréquence dois-je mettre à jour ma bio ?', a: 'La rafraîchir dès que vous avez une nouvelle campagne, un produit ou un contenu est une excellente habitude. Une bio figée ne dit jamais rien de neuf à vos abonnés.' },
    ],
    pt: [
      { q: 'Quantos caracteres a bio do Instagram permite?', a: 'A bio do Instagram aceita até 150 caracteres. Dentro desse limite, você precisa de um texto claro, envolvente e voltado para a ação.' },
      { q: 'Posso colocar um link na bio?', a: 'Sim, exatamente um link clicável. É por isso que serviços de link na bio como o BeyLink são ideais para reunir todos os seus destinos em uma única página.' },
      { q: 'Devo usar emojis?', a: 'Sim. Usados com moderação, eles chamam a atenção e deixam a sua bio mais fácil de ler. De três a cinco emojis é o ideal; exagerar faz parecer spam.' },
      { q: 'Com que frequência devo atualizar a bio?', a: 'Renová-la sempre que você tem uma campanha, um produto ou um conteúdo novo é um ótimo hábito. Uma bio parada nunca conta nada de novo para seus seguidores.' },
    ],
    it: [
      { q: 'Quanti caratteri può avere una bio Instagram?', a: 'Le bio di Instagram supportano fino a 150 caratteri. Entro questo limite ti serve un testo chiaro, coinvolgente e orientato all\'azione.' },
      { q: 'Posso mettere un link nella bio?', a: 'Sì, esattamente un link cliccabile. Ecco perché i servizi di link in bio come BeyLink sono ideali per raccogliere tutte le tue destinazioni in un\'unica pagina.' },
      { q: 'Dovrei usare le emoji?', a: 'Sì. Usate con moderazione, attirano l\'occhio e rendono la bio più facile da scorrere. Da tre a cinque emoji è il numero ideale; esagerare fa sembrare tutto spam.' },
      { q: 'Ogni quanto dovrei aggiornare la bio?', a: 'Rinfrescarla ogni volta che hai una nuova campagna, un prodotto o un contenuto è un\'ottima abitudine. Una bio statica non racconta mai niente di nuovo ai tuoi follower.' },
    ],
    ja: [
      { q: 'Instagramのプロフィールは何文字まで入りますか？', a: 'Instagramのプロフィール文は最大150文字までです。この制限のなかで、明確で、心をつかみ、行動を促す文章が必要になります。' },
      { q: 'プロフィールにリンクを入れられますか？', a: 'はい、クリックできるリンクをちょうど1つ入れられます。だからこそ、BeyLinkのようなプロフィールリンクのサービスは、すべての行き先を1ページにまとめるのに最適です。' },
      { q: '絵文字は使うべきですか？', a: 'はい。ほどよく使えば目を引き、プロフィールが読みやすくなります。3〜5個が理想で、使いすぎると逆にスパムのように見えてしまいます。' },
      { q: 'プロフィールはどのくらいの頻度で更新すべきですか？', a: '新しいキャンペーンや商品、コンテンツができたら更新するのが良い習慣です。ずっと同じプロフィールでは、フォロワーに新しい情報が何も伝わりません。' },
    ],
  },
};

function PostTr() {
  return (
    <>
      <P>
        Instagram bio'n, dijital vitrinin. Ziyaretçi profilini açtığında 3 saniye içinde <strong>seni takip edip
        etmeyeceğine karar veriyor</strong>. Peki 150 karakter içinde nasıl kazanırsın? Bu rehberde takipçiyi
        müşteriye çeviren 10 kuralı ve gerçek örneklerle bio formüllerini paylaşıyoruz.
      </P>

      <H2>Instagram bio neden bu kadar önemli?</H2>
      <P>
        Meta'nın 2024 verilerine göre, ziyaretçilerin <strong>%70'i profil kartını gördükten sonra 5 saniye içinde takip et/etme kararı veriyor</strong>.
        Bu 5 saniyenin 3'ünde bio'nu okuyorlar. Yani bio'n:
      </P>
      <UL>
        <li>Kim olduğunu tek cümlede anlatmalı</li>
        <li>Neye değer kattığını göstermeli</li>
        <li>Bir sonraki adımı (link tıkla, DM at, takip et) net söylemeli</li>
      </UL>

      <H2>10 Kural: Optimize edilmiş bio nasıl yazılır?</H2>

      <H3>1. İsim alanını (name field) SEO için kullan</H3>
      <P>
        Kullanıcı adı (@username) sabit kalır ama <strong>isim alanı</strong> Instagram'da aranabilir. "Ayşe Yılmaz"
        yerine "Ayşe Yılmaz | Pasta Tarifleri" yaz. İnsanlar "pasta tarifleri" arayınca senin hesabın çıkar.
      </P>

      <H3>2. İlk cümle: değer önerisi</H3>
      <P>
        "Neyi kim için yapıyorum?" cevabını ilk cümlede ver. Örnek:
      </P>
      <UL>
        <li>❌ "Merhaba, ben Ayşe. Yemek yapmayı seviyorum."</li>
        <li>✅ "20 dakikada hazır sağlıklı tarifler paylaşıyorum. 🍅"</li>
      </UL>

      <H3>3. Kimlik doğrulayan detay</H3>
      <P>
        Kredibilite (güvenilirlik) katan bir ayrıntı ekle: "10K+ tarif takipçisi", "Yemek yazarı", "Cordon Bleu mezunu"
        gibi. Neden takip edilmen gerektiğine dair kanıt.
      </P>

      <H3>4. Emoji ile bölümlendir</H3>
      <P>
        Emojiler <strong>sınırlayıcı</strong> gibi çalışır — okumayı 3 kata çıkarır. 3-5 emoji ideal.
      </P>
      <Callout tone="info" title="Emoji formülü">
        📍 Konum · 🎯 Ne yaparım · 📩 İletişim yolu · 👇 Aşağıdaki linke tıkla — bu 4 emoji tek başına bir
        bio iskeleti oluşturur.
      </Callout>

      <H3>5. Harekete geçirici ok (CTA)</H3>
      <P>
        Bio'nun sonunda mutlaka <strong>bir ok emojisi</strong> (👇 veya 🔗) ile link'e dikkat çek. Instagram tasarımı
        gereği link, bio'nun hemen altında; ok bir psikolojik "aşağı bak" tetikleyicisidir.
      </P>

      <H3>6. Tek link, tüm bağlantılar</H3>
      <P>
        Bio'daki tek link alanına doğrudan bir ürün ya da web sitesi yerine bir <A href="/blog/what-is-link-in-bio">link-in-bio sayfası</A>{' '}
        koy. Böylece:
      </P>
      <UL>
        <li>YouTube, TikTok, Spotify, mağaza, blog — hepsini tek sayfada toplarsın</li>
        <li>Instagram bio'yu değiştirmeden yeni bir kampanya ekleyebilirsin</li>
        <li>Hangi linkin daha çok tıklandığını görebilirsin (analytics)</li>
      </UL>

      <InlineCta
        title="Instagram bio linki için BeyLink kullan"
        desc="Ücretsiz. 5 dakikada kurulur. Tıklama analizi dahil."
        href="/register"
        label="Hemen Başla →"
      />

      <H3>7. Kategori seçimi</H3>
      <P>
        Instagram profilinde <strong>işletme kategori</strong> alanı seçilebilir (Ayarlar {'>'} Hesap Türü). "Sanatçı",
        "Yemek Blog'u", "Fotoğrafçı" gibi. Bu Instagram'ın seni doğru kullanıcıya önermesini sağlar.
      </P>

      <H3>8. İletişim düğmeleri</H3>
      <P>
        Instagram Business/Creator hesabında "E-posta", "Arama" ve "Yol Tarifi" düğmeleri eklenebilir. Yeri gelirse yerleştir.
        Bio'da e-posta yazmana gerek kalmaz.
      </P>

      <H3>9. Hikayeler için öne çıkanlar</H3>
      <P>
        Bio'nun hemen altındaki "öne çıkanlar" (highlights) küçük kapak görsellerinin renkleri ve isimleri de bio'nun
        parçasıdır. Tutarlı bir tema seç — 5 kapak, 5 kelimelik başlık.
      </P>

      <H3>10. Test et, ölç, yenile</H3>
      <P>
        Bio'nu 2 hafta boyunca aynı tut, sonra bir cümleyi değiştir. Takipçi artışını ve link tıklamalarını karşılaştır.
        Optimizasyon her zaman veri odaklı yapılır.
      </P>

      <H2>Örnek bio formülleri (kopyala, uyarla)</H2>
      <P>Aşağıdakiler farklı sektörler için hazır iskelet:</P>

      <H3>İçerik üreticisi</H3>
      <Callout>
        📸 Fotoğrafçı | İstanbul<br />
        🎯 Sokak & belgesel foto<br />
        📚 5.000+ öğrenci<br />
        👇 Portföy ve kurslar
      </Callout>

      <H3>Restoran / kafe</H3>
      <Callout>
        🍔 Kadıköy | 2018'den beri<br />
        🌱 %100 vegan burger<br />
        🕒 12:00–23:00 · 7 gün<br />
        📍 Menü + rezervasyon 👇
      </Callout>

      <H3>Freelancer / danışman</H3>
      <Callout>
        🎨 Marka & Web Tasarım<br />
        🏆 6 yıl · 50+ marka<br />
        💬 Ücretsiz keşif görüşmesi<br />
        👇 Portföy + iletişim
      </Callout>

      <H3>Kişisel marka</H3>
      <Callout>
        💼 Pazarlama Direktörü<br />
        📚 SaaS büyüme uzmanı<br />
        🎙️ "Growth Sohbetleri" podcast<br />
        👇 Yazılar, kurslar, iletişim
      </Callout>

      <H2>Sık yapılan hatalar</H2>
      <OL>
        <li><strong>150 karakteri doldurmaya çalışmak:</strong> Boş yer bırakmak okunabilirliği artırır.</li>
        <li><strong>Değer önerisi olmadan sadece hobiler:</strong> "Yemek, kitap, kedi" bio değil, hashtag.</li>
        <li><strong>Sabit kalmak:</strong> 6 aydır aynı bio? Yeni bir şey söylüyorsun demektir — güncelle.</li>
        <li><strong>Link yerine e-posta yazmak:</strong> Instagram'da e-posta tıklanmaz, kopyalanır. Zayıf CTA.</li>
        <li><strong>Aşırı hashtag:</strong> Bio'da hashtag arama sonuçlarına girmez; sadece görsel kirlilik.</li>
      </OL>

      <H2>Sonuç: bio'n dijital karşılamadır</H2>
      <P>
        Instagram bio senin ilk izlenimin. 150 karakterle satış yapmıyorsun — <strong>ilgiyi merakla değiştiriyorsun</strong>.
        Ziyaretçin merak edip senin link-in-bio sayfana geçtiğinde, gerçek dönüşüm orada olur. Bio'yu bir kez optimize et,
        <A href="/register"> BeyLink</A> sayfanı da hazırla — takipçileri müşteriye çevirmek çok daha kolay olsun.
      </P>
    </>
  );
}

function PostEn() {
  return (
    <>
      <P>
        Your Instagram bio is your digital storefront. Within three seconds of opening your profile, a visitor decides
        <strong> whether or not to follow you</strong>. So how do you win them over in 150 characters? In this guide we
        share the 10 rules that turn followers into customers, plus bio formulas backed by real examples.
      </P>

      <H2>Why does your Instagram bio matter so much?</H2>
      <P>
        According to Meta's 2024 data, <strong>70% of visitors decide whether to follow within five seconds of seeing your profile card</strong>.
        They spend three of those five seconds reading your bio. So your bio has to:
      </P>
      <UL>
        <li>Say who you are in a single sentence</li>
        <li>Show the value you add</li>
        <li>Spell out the next step (tap the link, send a DM, hit follow)</li>
      </UL>

      <H2>The 10 rules for writing an optimized bio</H2>

      <H3>1. Use the name field for SEO</H3>
      <P>
        Your handle (@username) stays fixed, but the <strong>name field</strong> is searchable on Instagram. Instead of
        “Ayşe Yılmaz,” write “Ayşe Yılmaz | Dessert Recipes.” When people search “dessert recipes,” your account surfaces.
      </P>

      <H3>2. First line: your value proposition</H3>
      <P>
        Answer “what do I make, and who is it for?” in your very first line. For example:
      </P>
      <UL>
        <li>❌ “Hi, I'm Ayşe. I love cooking.”</li>
        <li>✅ “Healthy recipes ready in 20 minutes. 🍅”</li>
      </UL>

      <H3>3. A credibility detail</H3>
      <P>
        Add one detail that builds trust: “10K+ recipe followers,” “Food writer,” “Cordon Bleu graduate.” Proof of why
        someone should follow you.
      </P>

      <H3>4. Break it up with emojis</H3>
      <P>
        Emojis act like <strong>dividers</strong>: they triple readability. Three to five is the sweet spot.
      </P>
      <Callout tone="info" title="The emoji formula">
        📍 Location · 🎯 What I do · 📩 How to reach me · 👇 Tap the link below. Those four emojis alone give you a
        complete bio skeleton.
      </Callout>

      <H3>5. An action-driving arrow (CTA)</H3>
      <P>
        Always end your bio by pointing to the link with <strong>an arrow emoji</strong> (👇 or 🔗). By Instagram's own
        design, the link sits right below your bio; the arrow is a psychological “look down” trigger.
      </P>

      <H3>6. One link, all your destinations</H3>
      <P>
        In that single bio link slot, put a <A href="/blog/what-is-link-in-bio">link-in-bio page</A> instead of pointing
        straight to one product or website. That way:
      </P>
      <UL>
        <li>YouTube, TikTok, Spotify, store, blog: you gather them all on one page</li>
        <li>You can add a new campaign without ever touching your Instagram bio</li>
        <li>You can see which link gets clicked most (analytics)</li>
      </UL>

      <InlineCta
        title="Use BeyLink for your Instagram bio link"
        desc="Free. Set up in five minutes. Click analytics included."
        href="/register"
        label="Get Started →"
      />

      <H3>7. Pick a category</H3>
      <P>
        On your Instagram profile you can choose a <strong>business category</strong> (Settings {'>'} Account Type):
        “Artist,” “Food Blog,” “Photographer,” and so on. This helps Instagram recommend you to the right users.
      </P>

      <H3>8. Contact buttons</H3>
      <P>
        On an Instagram Business/Creator account you can add “Email,” “Call,” and “Directions” buttons. Add them where
        they fit, so you don't have to spell out your email in the bio.
      </P>

      <H3>9. Story highlights</H3>
      <P>
        The colors and titles of the little cover thumbnails in your Story highlights, right beneath your bio, are part
        of the bio too. Pick a consistent theme: five covers, five-word titles.
      </P>

      <H3>10. Test, measure, refresh</H3>
      <P>
        Keep your bio the same for two weeks, then change one line. Compare your follower growth and link clicks against
        the previous period. Optimization is always driven by data.
      </P>

      <H2>Example bio formulas (copy and adapt)</H2>
      <P>Here are ready-made skeletons for different industries:</P>

      <H3>Creator</H3>
      <Callout>
        📸 Photographer | İstanbul<br />
        🎯 Street & documentary photos<br />
        📚 5,000+ students<br />
        👇 Portfolio and courses
      </Callout>

      <H3>Restaurant / café</H3>
      <Callout>
        🍔 Kadıköy | Since 2018<br />
        🌱 100% vegan burgers<br />
        🕒 12:00–23:00 · 7 days<br />
        📍 Menu + reservations 👇
      </Callout>

      <H3>Freelancer / consultant</H3>
      <Callout>
        🎨 Brand & Web Design<br />
        🏆 6 years · 50+ brands<br />
        💬 Free discovery call<br />
        👇 Portfolio + contact
      </Callout>

      <H3>Personal brand</H3>
      <Callout>
        💼 Marketing Director<br />
        📚 SaaS growth expert<br />
        🎙️ “Growth Talks” podcast<br />
        👇 Articles, courses, contact
      </Callout>

      <H2>Common mistakes</H2>
      <OL>
        <li><strong>Trying to fill all 150 characters:</strong> leaving white space improves readability.</li>
        <li><strong>Hobbies with no value proposition:</strong> “Food, books, cats” isn't a bio, it's a hashtag.</li>
        <li><strong>Staying static:</strong> same bio for six months? That means you have something new to say, so update it.</li>
        <li><strong>Writing an email instead of a link:</strong> on Instagram, emails don't get tapped, they get copied. Weak CTA.</li>
        <li><strong>Too many hashtags:</strong> hashtags in a bio don't show up in search results; they're just visual clutter.</li>
      </OL>

      <H2>The takeaway: your bio is a digital greeting</H2>
      <P>
        Your Instagram bio is your first impression. You're not selling in 150 characters; you're <strong>trading
        interest for curiosity</strong>. The real conversion happens once that curious visitor taps through to your
        link-in-bio page. Optimize your bio once, set up your <A href="/register">BeyLink</A> page too, and turning
        followers into customers gets a whole lot easier.
      </P>
    </>
  );
}

function PostRu() {
  return (
    <>
      <P>
        Ваше Instagram-био это ваша цифровая витрина. За три секунды после открытия профиля посетитель решает,
        <strong> подписываться на вас или нет</strong>. Как же покорить его за 150 символов? В этом руководстве мы делимся
        10 правилами, которые превращают подписчиков в клиентов, плюс формулами био на реальных примерах.
      </P>

      <H2>Почему Instagram-био так важно?</H2>
      <P>
        По данным Meta за 2024 год, <strong>70% посетителей решают, подписываться ли, за пять секунд после того, как увидели карточку профиля</strong>.
        Три из этих пяти секунд они читают ваше био. Значит, ваше био должно:
      </P>
      <UL>
        <li>Сказать, кто вы, одним предложением</li>
        <li>Показать, какую ценность вы даёте</li>
        <li>Чётко назвать следующий шаг (нажать ссылку, написать в личку, подписаться)</li>
      </UL>

      <H2>10 правил: как написать оптимизированное био</H2>

      <H3>1. Используйте поле имени для SEO</H3>
      <P>
        Ваш ник (@username) остаётся неизменным, но <strong>поле имени</strong> ищется в Instagram. Вместо
        «Анна Петрова» напишите «Анна Петрова | Рецепты десертов». Когда люди ищут «рецепты десертов», ваш аккаунт всплывает.
      </P>

      <H3>2. Первая строка: ваше ценностное предложение</H3>
      <P>
        Ответьте на вопрос «что я делаю и для кого?» в самой первой строке. Например:
      </P>
      <UL>
        <li>❌ «Привет, я Анна. Люблю готовить.»</li>
        <li>✅ «Полезные рецепты, готовые за 20 минут. 🍅»</li>
      </UL>

      <H3>3. Деталь, подтверждающая экспертность</H3>
      <P>
        Добавьте одну деталь, которая вызывает доверие: «10K+ подписчиков-кулинаров», «Пищевой автор», «Выпускница Cordon Bleu».
        Доказательство того, почему на вас стоит подписаться.
      </P>

      <H3>4. Разбейте текст эмодзи</H3>
      <P>
        Эмодзи работают как <strong>разделители</strong>: они утраивают читаемость. Три-пять штук это оптимум.
      </P>
      <Callout tone="info" title="Формула эмодзи">
        📍 Локация · 🎯 Чем занимаюсь · 📩 Как со мной связаться · 👇 Нажмите ссылку ниже. Эти четыре эмодзи уже сами по себе
        дают готовый каркас био.
      </Callout>

      <H3>5. Стрелка, побуждающая к действию (CTA)</H3>
      <P>
        Всегда завершайте био указанием на ссылку с помощью <strong>эмодзи-стрелки</strong> (👇 или 🔗). По самой логике
        дизайна Instagram ссылка стоит прямо под био; стрелка это психологический триггер «посмотри вниз».
      </P>

      <H3>6. Одна ссылка, все ваши адреса</H3>
      <P>
        В этот единственный слот для ссылки в био поставьте <A href="/blog/what-is-link-in-bio">страницу ссылки в био</A>,
        а не прямую ссылку на один товар или сайт. Так вы:
      </P>
      <UL>
        <li>Собираете YouTube, TikTok, Spotify, магазин, блог, всё на одной странице</li>
        <li>Можете добавить новую кампанию, ни разу не трогая био в Instagram</li>
        <li>Видите, какую ссылку нажимают чаще всего (аналитика)</li>
      </UL>

      <InlineCta
        title="Используйте BeyLink для ссылки в Instagram-био"
        desc="Бесплатно. Настройка за пять минут. Аналитика кликов включена."
        href="/register"
        label="Начать →"
      />

      <H3>7. Выберите категорию</H3>
      <P>
        В профиле Instagram можно выбрать <strong>категорию бизнеса</strong> (Настройки {'>'} Тип аккаунта):
        «Художник», «Кулинарный блог», «Фотограф» и так далее. Это помогает Instagram рекомендовать вас нужным пользователям.
      </P>

      <H3>8. Кнопки контактов</H3>
      <P>
        В аккаунте Instagram Business/Creator можно добавить кнопки «Почта», «Позвонить» и «Как добраться». Разместите их там,
        где уместно, чтобы не прописывать почту прямо в био.
      </P>

      <H3>9. Актуальное из историй</H3>
      <P>
        Цвета и названия маленьких обложек в актуальном из историй, прямо под вашим био, тоже часть био. Выберите единый стиль:
        пять обложек, названия из пяти слов.
      </P>

      <H3>10. Тестируйте, измеряйте, обновляйте</H3>
      <P>
        Оставьте био неизменным на две недели, затем поменяйте одну строку. Сравните прирост подписчиков и клики по ссылке
        с прошлым периодом. Оптимизация всегда опирается на данные.
      </P>

      <H2>Готовые формулы био (копируйте и адаптируйте)</H2>
      <P>Вот готовые каркасы для разных сфер:</P>

      <H3>Автор</H3>
      <Callout>
        📸 Фотограф | Милан<br />
        🎯 Стрит и документальные фото<br />
        📚 5 000+ учеников<br />
        👇 Портфолио и курсы
      </Callout>

      <H3>Ресторан / кафе</H3>
      <Callout>
        🍔 Сохо | с 2018 года<br />
        🌱 100% веган-бургеры<br />
        🕒 12:00–23:00 · 7 дней<br />
        📍 Меню + бронь 👇
      </Callout>

      <H3>Фрилансер / консультант</H3>
      <Callout>
        🎨 Бренд и веб-дизайн<br />
        🏆 6 лет · 50+ брендов<br />
        💬 Бесплатная консультация<br />
        👇 Портфолио + контакты
      </Callout>

      <H3>Личный бренд</H3>
      <Callout>
        💼 Директор по маркетингу<br />
        📚 Эксперт по росту SaaS<br />
        🎙️ Подкаст «Growth Talks»<br />
        👇 Статьи, курсы, контакты
      </Callout>

      <H2>Частые ошибки</H2>
      <OL>
        <li><strong>Попытка забить все 150 символов:</strong> свободное пространство улучшает читаемость.</li>
        <li><strong>Хобби без ценностного предложения:</strong> «Еда, книги, коты» это не био, а хэштег.</li>
        <li><strong>Оставаться статичным:</strong> одно и то же био полгода? Значит, вам есть что сказать нового, обновите его.</li>
        <li><strong>Писать почту вместо ссылки:</strong> в Instagram почту не нажимают, а копируют. Слабый CTA.</li>
        <li><strong>Слишком много хэштегов:</strong> хэштеги в био не попадают в результаты поиска, это лишь визуальный шум.</li>
      </OL>

      <H2>Вывод: ваше био это цифровое приветствие</H2>
      <P>
        Ваше Instagram-био это первое впечатление. Вы не продаёте за 150 символов, вы <strong>меняете интерес на
        любопытство</strong>. Настоящая конверсия происходит, когда любопытный посетитель переходит на вашу страницу ссылки
        в био. Оптимизируйте био один раз, соберите ещё и свою страницу <A href="/register">BeyLink</A>, и превращать
        подписчиков в клиентов станет гораздо проще.
      </P>
    </>
  );
}

function PostEs() {
  return (
    <>
      <P>
        Tu bio de Instagram es tu escaparate digital. En los tres segundos siguientes a abrir tu perfil, un visitante decide
        <strong> si te sigue o no</strong>. Entonces, ¿cómo lo conquistas en 150 caracteres? En esta guía compartimos las
        10 reglas que convierten seguidores en clientes, además de fórmulas de bio respaldadas por ejemplos reales.
      </P>

      <H2>¿Por qué importa tanto tu bio de Instagram?</H2>
      <P>
        Según los datos de Meta de 2024, <strong>el 70% de los visitantes decide si te sigue en los cinco segundos siguientes a ver tu tarjeta de perfil</strong>.
        Tres de esos cinco segundos los pasan leyendo tu bio. Así que tu bio tiene que:
      </P>
      <UL>
        <li>Decir quién eres en una sola frase</li>
        <li>Mostrar el valor que aportas</li>
        <li>Dejar claro el siguiente paso (tocar el enlace, enviar un DM, darle a seguir)</li>
      </UL>

      <H2>Las 10 reglas para escribir una bio optimizada</H2>

      <H3>1. Usa el campo de nombre para el SEO</H3>
      <P>
        Tu usuario (@username) es fijo, pero el <strong>campo de nombre</strong> se puede buscar en Instagram. En lugar de
        "Ana García", escribe "Ana García | Recetas de postres". Cuando la gente busca "recetas de postres", tu cuenta aparece.
      </P>

      <H3>2. Primera línea: tu propuesta de valor</H3>
      <P>
        Responde "¿qué hago y para quién es?" en tu primera línea. Por ejemplo:
      </P>
      <UL>
        <li>❌ "Hola, soy Ana. Me encanta cocinar."</li>
        <li>✅ "Recetas saludables listas en 20 minutos. 🍅"</li>
      </UL>

      <H3>3. Un detalle que dé credibilidad</H3>
      <P>
        Añade un detalle que genere confianza: "10K+ seguidores de recetas", "Escritora gastronómica", "Graduada en Cordon Bleu".
        Una prueba de por qué alguien debería seguirte.
      </P>

      <H3>4. Divídela con emojis</H3>
      <P>
        Los emojis funcionan como <strong>separadores</strong>: triplican la legibilidad. Entre tres y cinco es el punto justo.
      </P>
      <Callout tone="info" title="La fórmula de emojis">
        📍 Ubicación · 🎯 Qué hago · 📩 Cómo contactarme · 👇 Toca el enlace de abajo. Esos cuatro emojis ya te dan un
        esqueleto de bio completo.
      </Callout>

      <H3>5. Una flecha que impulsa la acción (CTA)</H3>
      <P>
        Termina siempre tu bio apuntando al enlace con <strong>un emoji de flecha</strong> (👇 o 🔗). Por el propio diseño
        de Instagram, el enlace queda justo debajo de tu bio; la flecha es un disparador psicológico de "mira abajo".
      </P>

      <H3>6. Un enlace, todos tus destinos</H3>
      <P>
        En esa única ranura de enlace de la bio, pon una <A href="/blog/what-is-link-in-bio">página link in bio</A> en lugar
        de apuntar directamente a un solo producto o web. Así:
      </P>
      <UL>
        <li>YouTube, TikTok, Spotify, tienda, blog: los reúnes todos en una sola página</li>
        <li>Puedes añadir una campaña nueva sin tocar jamás tu bio de Instagram</li>
        <li>Puedes ver qué enlace recibe más clics (analítica)</li>
      </UL>

      <InlineCta
        title="Usa BeyLink para el enlace de tu bio de Instagram"
        desc="Gratis. Se configura en cinco minutos. Analítica de clics incluida."
        href="/register"
        label="Empieza ya →"
      />

      <H3>7. Elige una categoría</H3>
      <P>
        En tu perfil de Instagram puedes elegir una <strong>categoría de negocio</strong> (Ajustes {'>'} Tipo de cuenta):
        "Artista", "Blog de cocina", "Fotógrafo", etc. Esto ayuda a Instagram a recomendarte a los usuarios adecuados.
      </P>

      <H3>8. Botones de contacto</H3>
      <P>
        En una cuenta de Instagram Business/Creator puedes añadir botones de "Correo", "Llamar" y "Cómo llegar". Ponlos donde
        encajen, para no tener que escribir tu correo en la bio.
      </P>

      <H3>9. Historias destacadas</H3>
      <P>
        Los colores y títulos de las pequeñas portadas de tus historias destacadas, justo debajo de tu bio, también forman
        parte de la bio. Elige un estilo coherente: cinco portadas, títulos de cinco palabras.
      </P>

      <H3>10. Prueba, mide, renueva</H3>
      <P>
        Mantén tu bio igual durante dos semanas y luego cambia una línea. Compara el crecimiento de seguidores y los clics en
        el enlace con el periodo anterior. La optimización siempre se guía por los datos.
      </P>

      <H2>Fórmulas de bio de ejemplo (copia y adapta)</H2>
      <P>Aquí tienes esqueletos listos para distintos sectores:</P>

      <H3>Creador</H3>
      <Callout>
        📸 Fotógrafo | Madrid<br />
        🎯 Foto callejera y documental<br />
        📚 5.000+ alumnos<br />
        👇 Portafolio y cursos
      </Callout>

      <H3>Restaurante / cafetería</H3>
      <Callout>
        🍔 Malasaña | Desde 2018<br />
        🌱 Hamburguesas 100% veganas<br />
        🕒 12:00-23:00 · 7 días<br />
        📍 Menú + reservas 👇
      </Callout>

      <H3>Freelancer / consultor</H3>
      <Callout>
        🎨 Diseño de marca y web<br />
        🏆 6 años · 50+ marcas<br />
        💬 Llamada de descubrimiento gratis<br />
        👇 Portafolio + contacto
      </Callout>

      <H3>Marca personal</H3>
      <Callout>
        💼 Directora de marketing<br />
        📚 Experta en crecimiento SaaS<br />
        🎙️ Pódcast "Growth Talks"<br />
        👇 Artículos, cursos, contacto
      </Callout>

      <H2>Errores frecuentes</H2>
      <OL>
        <li><strong>Intentar llenar los 150 caracteres:</strong> dejar espacios en blanco mejora la legibilidad.</li>
        <li><strong>Aficiones sin propuesta de valor:</strong> "Comida, libros, gatos" no es una bio, es un hashtag.</li>
        <li><strong>Quedarte estático:</strong> ¿la misma bio durante seis meses? Significa que tienes algo nuevo que decir, así que actualízala.</li>
        <li><strong>Escribir un correo en lugar de un enlace:</strong> en Instagram, los correos no se tocan, se copian. Un CTA débil.</li>
        <li><strong>Demasiados hashtags:</strong> los hashtags en la bio no aparecen en los resultados de búsqueda; son solo ruido visual.</li>
      </OL>

      <H2>La conclusión: tu bio es un saludo digital</H2>
      <P>
        Tu bio de Instagram es tu primera impresión. No estás vendiendo en 150 caracteres; estás <strong>cambiando interés
        por curiosidad</strong>. La conversión de verdad ocurre cuando ese visitante curioso pasa a tu página link in bio.
        Optimiza tu bio una vez, monta también tu página de <A href="/register">BeyLink</A>, y convertir seguidores en
        clientes será mucho más fácil.
      </P>
    </>
  );
}

function PostDe() {
  return (
    <>
      <P>
        Deine Instagram-Bio ist dein digitales Schaufenster. Innerhalb von drei Sekunden nach dem Öffnen deines Profils
        entscheidet ein Besucher, <strong>ob er dir folgt oder nicht</strong>. Wie also gewinnst du ihn in 150 Zeichen
        für dich? In diesem Guide teilen wir die 10 Regeln, die aus Followern Kunden machen, plus Bio-Formeln mit echten
        Beispielen.
      </P>

      <H2>Warum ist deine Instagram-Bio so wichtig?</H2>
      <P>
        Laut Metas Daten von 2024 <strong>entscheiden 70 % der Besucher innerhalb von fünf Sekunden nach dem Anblick
        deiner Profilkarte, ob sie folgen</strong>. Drei dieser fünf Sekunden verbringen sie mit dem Lesen deiner Bio.
        Deine Bio muss also:
      </P>
      <UL>
        <li>In einem einzigen Satz sagen, wer du bist</li>
        <li>Zeigen, welchen Mehrwert du bietest</li>
        <li>Den nächsten Schritt klar benennen (den Link antippen, eine DM schicken, auf Folgen tippen)</li>
      </UL>

      <H2>Die 10 Regeln für eine optimierte Bio</H2>

      <H3>1. Nutze das Namensfeld für SEO</H3>
      <P>
        Dein Handle (@username) bleibt fix, aber das <strong>Namensfeld</strong> ist auf Instagram durchsuchbar. Statt
        „Lena Fischer“ schreibst du „Lena Fischer | Dessert-Rezepte“. Wenn Leute nach „Dessert-Rezepte“ suchen, taucht
        dein Account auf.
      </P>

      <H3>2. Erste Zeile: dein Wertversprechen</H3>
      <P>
        Beantworte in der allerersten Zeile: „Was mache ich und für wen?“. Zum Beispiel:
      </P>
      <UL>
        <li>❌ „Hi, ich bin Lena. Ich koche gern.“</li>
        <li>✅ „Gesunde Rezepte, in 20 Minuten fertig. 🍅“</li>
      </UL>

      <H3>3. Ein Detail, das Glaubwürdigkeit schafft</H3>
      <P>
        Füge ein Detail hinzu, das Vertrauen aufbaut: „10K+ Rezept-Follower“, „Foodautorin“, „Cordon-Bleu-Absolventin“.
        Ein Beweis, warum dir jemand folgen sollte.
      </P>

      <H3>4. Gliedere mit Emojis</H3>
      <P>
        Emojis wirken wie <strong>Trenner</strong>: Sie verdreifachen die Lesbarkeit. Drei bis fünf sind der ideale Wert.
      </P>
      <Callout tone="info" title="Die Emoji-Formel">
        📍 Standort · 🎯 Was ich mache · 📩 Wie du mich erreichst · 👇 Tippe den Link unten an. Diese vier Emojis allein
        geben dir ein komplettes Bio-Gerüst.
      </Callout>

      <H3>5. Ein handlungsauslösender Pfeil (CTA)</H3>
      <P>
        Beende deine Bio immer mit einem Verweis auf den Link über <strong>ein Pfeil-Emoji</strong> (👇 oder 🔗). Durch
        Instagrams eigenes Design sitzt der Link direkt unter deiner Bio; der Pfeil ist ein psychologischer
        „Schau nach unten“-Auslöser.
      </P>

      <H3>6. Ein Link, all deine Ziele</H3>
      <P>
        Setze in diesen einen Bio-Link-Slot eine <A href="/blog/what-is-link-in-bio">Link-in-Bio-Seite</A>, statt direkt
        auf ein einzelnes Produkt oder eine Website zu zeigen. So kannst du:
      </P>
      <UL>
        <li>YouTube, TikTok, Spotify, Shop, Blog: alles auf einer Seite bündeln</li>
        <li>Eine neue Kampagne hinzufügen, ohne je deine Instagram-Bio anzufassen</li>
        <li>Sehen, welcher Link am meisten geklickt wird (Analysen)</li>
      </UL>

      <InlineCta
        title="Nutze BeyLink für deinen Instagram-Bio-Link"
        desc="Kostenlos. In fünf Minuten eingerichtet. Klick-Analysen inklusive."
        href="/register"
        label="Loslegen →"
      />

      <H3>7. Wähle eine Kategorie</H3>
      <P>
        In deinem Instagram-Profil kannst du eine <strong>Unternehmenskategorie</strong> wählen (Einstellungen {'>'}{' '}
        Kontotyp): „Künstler“, „Food-Blog“, „Fotograf“ und so weiter. Das hilft Instagram, dich den richtigen Nutzern
        zu empfehlen.
      </P>

      <H3>8. Kontakt-Buttons</H3>
      <P>
        Bei einem Instagram-Business/Creator-Konto kannst du „E-Mail“-, „Anruf“- und „Wegbeschreibung“-Buttons
        hinzufügen. Setze sie ein, wo sie passen, damit du deine E-Mail nicht in der Bio ausschreiben musst.
      </P>

      <H3>9. Story-Highlights</H3>
      <P>
        Die Farben und Titel der kleinen Cover-Thumbnails in deinen Story-Highlights, direkt unter deiner Bio, sind
        ebenfalls Teil der Bio. Wähle ein einheitliches Thema: fünf Cover, Titel aus fünf Wörtern.
      </P>

      <H3>10. Testen, messen, auffrischen</H3>
      <P>
        Lass deine Bio zwei Wochen lang gleich, dann ändere eine Zeile. Vergleiche dein Follower-Wachstum und deine
        Link-Klicks mit dem vorherigen Zeitraum. Optimierung wird immer von Daten getrieben.
      </P>

      <H2>Beispiel-Bio-Formeln (kopieren und anpassen)</H2>
      <P>Hier sind fertige Gerüste für verschiedene Branchen:</P>

      <H3>Creator</H3>
      <Callout>
        📸 Fotograf | Berlin<br />
        🎯 Street- & Dokumentarfotos<br />
        📚 5.000+ Kursteilnehmer<br />
        👇 Portfolio und Kurse
      </Callout>

      <H3>Restaurant / Café</H3>
      <Callout>
        🍔 Kreuzberg | Seit 2018<br />
        🌱 100 % vegane Burger<br />
        🕒 12:00–23:00 · 7 Tage<br />
        📍 Speisekarte + Reservierung 👇
      </Callout>

      <H3>Freelancer / Berater</H3>
      <Callout>
        🎨 Brand- & Webdesign<br />
        🏆 6 Jahre · 50+ Marken<br />
        💬 Kostenloses Erstgespräch<br />
        👇 Portfolio + Kontakt
      </Callout>

      <H3>Persönliche Marke</H3>
      <Callout>
        💼 Marketing-Direktorin<br />
        📚 SaaS-Growth-Expertin<br />
        🎙️ Podcast „Growth Talks“<br />
        👇 Artikel, Kurse, Kontakt
      </Callout>

      <H2>Häufige Fehler</H2>
      <OL>
        <li><strong>Alle 150 Zeichen vollstopfen wollen:</strong> Weißraum verbessert die Lesbarkeit.</li>
        <li><strong>Hobbys ohne Wertversprechen:</strong> „Essen, Bücher, Katzen“ ist keine Bio, sondern ein Hashtag.</li>
        <li><strong>Statisch bleiben:</strong> seit sechs Monaten dieselbe Bio? Dann hast du etwas Neues zu sagen, also aktualisiere sie.</li>
        <li><strong>Eine E-Mail statt eines Links schreiben:</strong> Auf Instagram werden E-Mails nicht angetippt, sondern kopiert. Schwacher CTA.</li>
        <li><strong>Zu viele Hashtags:</strong> Hashtags in der Bio tauchen nicht in den Suchergebnissen auf; sie sind nur visuelles Rauschen.</li>
      </OL>

      <H2>Das Fazit: deine Bio ist eine digitale Begrüßung</H2>
      <P>
        Deine Instagram-Bio ist dein erster Eindruck. Du verkaufst nicht in 150 Zeichen, du <strong>tauschst Interesse
        gegen Neugier</strong>. Die echte Conversion passiert, sobald dieser neugierige Besucher zu deiner
        Link-in-Bio-Seite durchtippt. Optimiere deine Bio einmal, richte auch deine <A href="/register">BeyLink</A>-Seite
        ein, und Follower in Kunden zu verwandeln wird sehr viel leichter.
      </P>
    </>
  );
}

function PostFr() {
  return (
    <>
      <P>
        Votre bio Instagram, c'est votre vitrine numérique. Dans les trois secondes qui suivent l'ouverture de votre
        profil, un visiteur décide <strong>s'il vous suit ou non</strong>. Alors, comment le convaincre en 150 caractères ?
        Dans ce guide, nous partageons les 10 règles qui transforment les abonnés en clients, ainsi que des formules de bio
        appuyées par de vrais exemples.
      </P>

      <H2>Pourquoi votre bio Instagram compte-t-elle autant ?</H2>
      <P>
        Selon les données de Meta de 2024, <strong>70 % des visiteurs décident de suivre ou non dans les cinq secondes
        qui suivent l'affichage de votre carte de profil</strong>. Trois de ces cinq secondes servent à lire votre bio.
        Votre bio doit donc :
      </P>
      <UL>
        <li>Dire qui vous êtes en une seule phrase</li>
        <li>Montrer la valeur que vous apportez</li>
        <li>Nommer clairement l'étape suivante (toucher le lien, envoyer un DM, s'abonner)</li>
      </UL>

      <H2>Les 10 règles pour écrire une bio optimisée</H2>

      <H3>1. Servez-vous du champ nom pour le SEO</H3>
      <P>
        Votre identifiant (@username) reste fixe, mais le <strong>champ nom</strong> est indexé dans la recherche
        Instagram. Au lieu de « Léa Martin », écrivez « Léa Martin | Recettes de desserts ». Quand les gens cherchent
        « recettes de desserts », votre compte remonte.
      </P>

      <H3>2. Première ligne : votre proposition de valeur</H3>
      <P>
        Répondez à « qu'est-ce que je fais, et pour qui ? » dès la toute première ligne. Par exemple :
      </P>
      <UL>
        <li>❌ « Salut, moi c'est Léa. J'adore cuisiner. »</li>
        <li>✅ « Des recettes saines prêtes en 20 minutes. 🍅 »</li>
      </UL>

      <H3>3. Un détail qui crédibilise</H3>
      <P>
        Ajoutez un détail qui inspire confiance : « 10K+ abonnés recettes », « Autrice culinaire », « Diplômée du Cordon
        Bleu ». Une preuve de la raison pour laquelle on devrait vous suivre.
      </P>

      <H3>4. Aérez avec des emojis</H3>
      <P>
        Les emojis fonctionnent comme des <strong>séparateurs</strong> : ils triplent la lisibilité. Trois à cinq, c'est
        le bon équilibre.
      </P>
      <Callout tone="info" title="La formule emoji">
        📍 Lieu · 🎯 Ce que je fais · 📩 Comment me joindre · 👇 Touchez le lien ci-dessous. Ces quatre emojis suffisent
        à eux seuls à vous donner un squelette de bio complet.
      </Callout>

      <H3>5. Une flèche qui déclenche l'action (CTA)</H3>
      <P>
        Terminez toujours votre bio en pointant vers le lien avec <strong>un emoji de flèche</strong> (👇 ou 🔗). Par le
        design même d'Instagram, le lien se trouve juste sous votre bio ; la flèche est un déclencheur psychologique de
        « regarde en dessous ».
      </P>

      <H3>6. Un seul lien, toutes vos destinations</H3>
      <P>
        Dans cet unique emplacement de lien de bio, placez une <A href="/blog/what-is-link-in-bio">page de lien en bio</A>{' '}
        plutôt qu'un renvoi direct vers un seul produit ou site. Ainsi :
      </P>
      <UL>
        <li>YouTube, TikTok, Spotify, boutique, blog : vous les rassemblez tous sur une seule page</li>
        <li>Vous pouvez ajouter une nouvelle campagne sans jamais toucher à votre bio Instagram</li>
        <li>Vous voyez quel lien est le plus cliqué (statistiques)</li>
      </UL>

      <InlineCta
        title="Utilisez BeyLink pour le lien de votre bio Instagram"
        desc="Gratuit. Prêt en cinq minutes. Statistiques de clics incluses."
        href="/register"
        label="Commencer →"
      />

      <H3>7. Choisissez une catégorie</H3>
      <P>
        Sur votre profil Instagram, vous pouvez choisir une <strong>catégorie professionnelle</strong> (Paramètres {'>'}{' '}
        Type de compte) : « Artiste », « Blog culinaire », « Photographe », etc. Cela aide Instagram à vous recommander
        aux bons utilisateurs.
      </P>

      <H3>8. Boutons de contact</H3>
      <P>
        Sur un compte Instagram Business/Créateur, vous pouvez ajouter les boutons « E-mail », « Appeler » et
        « Itinéraire ». Placez-les là où c'est pertinent, pour ne pas avoir à écrire votre e-mail dans la bio.
      </P>

      <H3>9. Stories à la une</H3>
      <P>
        Les couleurs et les titres des petites vignettes de couverture de vos stories à la une, juste sous votre bio,
        font aussi partie de la bio. Choisissez un thème cohérent : cinq couvertures, des titres de cinq mots.
      </P>

      <H3>10. Testez, mesurez, renouvelez</H3>
      <P>
        Gardez votre bio identique pendant deux semaines, puis changez une ligne. Comparez la croissance de vos abonnés
        et les clics sur le lien avec la période précédente. L'optimisation se pilote toujours par la donnée.
      </P>

      <H2>Formules de bio d'exemple (à copier et adapter)</H2>
      <P>Voici des squelettes prêts à l'emploi pour différents secteurs :</P>

      <H3>Créateur</H3>
      <Callout>
        📸 Photographe | Paris<br />
        🎯 Photo de rue et documentaire<br />
        📚 5 000+ élèves<br />
        👇 Portfolio et cours
      </Callout>

      <H3>Restaurant / café</H3>
      <Callout>
        🍔 Le Marais | Depuis 2018<br />
        🌱 Burgers 100 % végétaliens<br />
        🕒 12:00–23:00 · 7 jours<br />
        📍 Menu + réservation 👇
      </Callout>

      <H3>Freelance / consultant</H3>
      <Callout>
        🎨 Design de marque et web<br />
        🏆 6 ans · 50+ marques<br />
        💬 Appel découverte gratuit<br />
        👇 Portfolio + contact
      </Callout>

      <H3>Marque personnelle</H3>
      <Callout>
        💼 Directrice marketing<br />
        📚 Experte croissance SaaS<br />
        🎙️ Podcast « Growth Talks »<br />
        👇 Articles, cours, contact
      </Callout>

      <H2>Erreurs fréquentes</H2>
      <OL>
        <li><strong>Vouloir remplir les 150 caractères :</strong> laisser des espaces blancs améliore la lisibilité.</li>
        <li><strong>Des loisirs sans proposition de valeur :</strong> « Cuisine, livres, chats » n'est pas une bio, c'est un hashtag.</li>
        <li><strong>Rester figé :</strong> la même bio depuis six mois ? C'est que vous avez du neuf à dire, alors mettez-la à jour.</li>
        <li><strong>Écrire un e-mail au lieu d'un lien :</strong> sur Instagram, les e-mails ne se touchent pas, ils se copient. CTA faible.</li>
        <li><strong>Trop de hashtags :</strong> les hashtags dans la bio n'apparaissent pas dans les résultats de recherche ; ce n'est que du bruit visuel.</li>
      </OL>

      <H2>En résumé : votre bio est un accueil numérique</H2>
      <P>
        Votre bio Instagram, c'est votre première impression. Vous ne vendez pas en 150 caractères, vous <strong>échangez
        de l'intérêt contre de la curiosité</strong>. La vraie conversion arrive quand ce visiteur curieux passe sur votre
        page de lien en bio. Optimisez votre bio une fois, montez aussi votre page <A href="/register">BeyLink</A>, et
        transformer vos abonnés en clients deviendra bien plus facile.
      </P>
    </>
  );
}

function PostPt() {
  return (
    <>
      <P>
        Sua bio do Instagram é a sua vitrine digital. Em três segundos depois de abrir o seu perfil, o visitante decide
        <strong> se vai te seguir ou não</strong>. Então, como conquistá-lo em 150 caracteres? Neste guia compartilhamos as
        10 regras que transformam seguidores em clientes, além de fórmulas de bio comprovadas por exemplos reais.
      </P>

      <H2>Por que a sua bio do Instagram importa tanto?</H2>
      <P>
        Segundo os dados da Meta de 2024, <strong>70% dos visitantes decidem se vão seguir nos cinco segundos após verem o seu cartão de perfil</strong>.
        Três desses cinco segundos são gastos lendo a sua bio. Então a sua bio precisa:
      </P>
      <UL>
        <li>Dizer quem você é em uma única frase</li>
        <li>Mostrar o valor que você entrega</li>
        <li>Deixar claro o próximo passo (tocar no link, mandar uma DM, apertar seguir)</li>
      </UL>

      <H2>As 10 regras para escrever uma bio otimizada</H2>

      <H3>1. Use o campo de nome para SEO</H3>
      <P>
        Seu @ (@username) é fixo, mas o <strong>campo de nome</strong> é pesquisável no Instagram. Em vez de
        "Camila Souza", escreva "Camila Souza | Receitas de Sobremesa". Quando as pessoas buscam "receitas de sobremesa", a sua conta aparece.
      </P>

      <H3>2. Primeira linha: sua proposta de valor</H3>
      <P>
        Responda "o que eu faço e para quem?" logo na primeira linha. Por exemplo:
      </P>
      <UL>
        <li>❌ "Oi, sou a Camila. Adoro cozinhar."</li>
        <li>✅ "Receitas saudáveis prontas em 20 minutos. 🍅"</li>
      </UL>

      <H3>3. Um detalhe de credibilidade</H3>
      <P>
        Acrescente um detalhe que gera confiança: "10K+ seguidores de receitas", "Escritora gastronômica", "Formada no Cordon Bleu".
        Uma prova de por que alguém deveria te seguir.
      </P>

      <H3>4. Separe com emojis</H3>
      <P>
        Emojis funcionam como <strong>divisores</strong>: eles triplicam a leiturabilidade. De três a cinco é o ponto ideal.
      </P>
      <Callout tone="info" title="A fórmula de emojis">
        📍 Localização · 🎯 O que eu faço · 📩 Como falar comigo · 👇 Toque no link abaixo. Esses quatro emojis já te dão
        um esqueleto de bio completo.
      </Callout>

      <H3>5. Uma seta que impulsiona a ação (CTA)</H3>
      <P>
        Sempre termine a bio apontando para o link com <strong>um emoji de seta</strong> (👇 ou 🔗). Pelo próprio design do
        Instagram, o link fica logo abaixo da sua bio; a seta é um gatilho psicológico de "olha para baixo".
      </P>

      <H3>6. Um link, todos os seus destinos</H3>
      <P>
        Naquele único espaço de link da bio, coloque uma <A href="/blog/what-is-link-in-bio">página de link na bio</A> em vez
        de apontar direto para um único produto ou site. Assim:
      </P>
      <UL>
        <li>YouTube, TikTok, Spotify, loja, blog: você reúne tudo em uma única página</li>
        <li>Você pode adicionar uma campanha nova sem nunca mexer na sua bio do Instagram</li>
        <li>Você consegue ver qual link é mais clicado (análises)</li>
      </UL>

      <InlineCta
        title="Use o BeyLink para o link da sua bio do Instagram"
        desc="Grátis. Pronto em cinco minutos. Análise de cliques incluída."
        href="/register"
        label="Comece agora →"
      />

      <H3>7. Escolha uma categoria</H3>
      <P>
        No seu perfil do Instagram você pode escolher uma <strong>categoria de negócio</strong> (Configurações {'>'} Tipo de conta):
        "Artista", "Blog de Culinária", "Fotógrafo" e por aí vai. Isso ajuda o Instagram a recomendar você para os usuários certos.
      </P>

      <H3>8. Botões de contato</H3>
      <P>
        Em uma conta Instagram Business/Creator você pode adicionar botões de "E-mail", "Ligar" e "Como chegar". Coloque onde
        fizer sentido, para não precisar escrever o seu e-mail na bio.
      </P>

      <H3>9. Destaques dos stories</H3>
      <P>
        As cores e os títulos das capinhas dos seus destaques dos stories, logo abaixo da sua bio, também fazem parte da bio.
        Escolha um tema consistente: cinco capas, títulos de cinco palavras.
      </P>

      <H3>10. Teste, meça, renove</H3>
      <P>
        Mantenha a sua bio igual por duas semanas, depois mude uma linha. Compare o crescimento de seguidores e os cliques no
        link com o período anterior. A otimização é sempre guiada por dados.
      </P>

      <H2>Fórmulas de bio de exemplo (copie e adapte)</H2>
      <P>Aqui estão esqueletos prontos para diferentes segmentos:</P>

      <H3>Criador</H3>
      <Callout>
        📸 Fotógrafo | São Paulo<br />
        🎯 Foto de rua e documental<br />
        📚 5.000+ alunos<br />
        👇 Portfólio e cursos
      </Callout>

      <H3>Restaurante / café</H3>
      <Callout>
        🍔 Vila Madalena | Desde 2018<br />
        🌱 Hambúrgueres 100% veganos<br />
        🕒 12:00–23:00 · 7 dias<br />
        📍 Cardápio + reservas 👇
      </Callout>

      <H3>Freelancer / consultor</H3>
      <Callout>
        🎨 Design de Marca e Web<br />
        🏆 6 anos · 50+ marcas<br />
        💬 Conversa inicial gratuita<br />
        👇 Portfólio + contato
      </Callout>

      <H3>Marca pessoal</H3>
      <Callout>
        💼 Diretora de Marketing<br />
        📚 Especialista em crescimento SaaS<br />
        🎙️ Podcast "Growth Talks"<br />
        👇 Artigos, cursos, contato
      </Callout>

      <H2>Erros comuns</H2>
      <OL>
        <li><strong>Tentar preencher todos os 150 caracteres:</strong> deixar espaço em branco melhora a leiturabilidade.</li>
        <li><strong>Hobbies sem proposta de valor:</strong> "Comida, livros, gatos" não é uma bio, é uma hashtag.</li>
        <li><strong>Ficar estático:</strong> a mesma bio há seis meses? Significa que você tem algo novo a dizer, então atualize.</li>
        <li><strong>Escrever um e-mail em vez de um link:</strong> no Instagram, e-mails não são tocados, são copiados. CTA fraco.</li>
        <li><strong>Hashtags demais:</strong> hashtags na bio não aparecem nos resultados de busca; são só poluição visual.</li>
      </OL>

      <H2>A conclusão: sua bio é uma recepção digital</H2>
      <P>
        Sua bio do Instagram é a sua primeira impressão. Você não está vendendo em 150 caracteres, você está <strong>trocando
        interesse por curiosidade</strong>. A conversão de verdade acontece quando esse visitante curioso toca e vai para a sua
        página de link na bio. Otimize a sua bio uma vez, monte também a sua página <A href="/register">BeyLink</A>, e
        transformar seguidores em clientes fica muito mais fácil.
      </P>
    </>
  );
}

function PostIt() {
  return (
    <>
      <P>
        La tua bio Instagram è la tua vetrina digitale. Entro tre secondi dall'apertura del tuo profilo, un visitatore
        decide <strong>se seguirti o no</strong>. Come lo conquisti, allora, in 150 caratteri? In questa guida
        condividiamo le 10 regole che trasformano i follower in clienti, oltre a formule di bio supportate da esempi reali.
      </P>

      <H2>Perché la tua bio Instagram conta così tanto?</H2>
      <P>
        Secondo i dati di Meta del 2024, <strong>il 70% dei visitatori decide se seguire entro cinque secondi dopo aver visto la tua scheda profilo</strong>.
        Tre di questi cinque secondi li passano leggendo la tua bio. Quindi la tua bio deve:
      </P>
      <UL>
        <li>Dire chi sei in una sola frase</li>
        <li>Mostrare il valore che offri</li>
        <li>Indicare chiaramente il passo successivo (tocca il link, manda un DM, premi segui)</li>
      </UL>

      <H2>Le 10 regole per scrivere una bio ottimizzata</H2>

      <H3>1. Usa il campo nome per la SEO</H3>
      <P>
        Il tuo handle (@username) resta fisso, ma il <strong>campo nome</strong> è ricercabile su Instagram. Invece di
        "Giulia Rossi", scrivi "Giulia Rossi | Ricette di dolci". Quando le persone cercano "ricette di dolci", il tuo
        account compare.
      </P>

      <H3>2. Prima riga: la tua proposta di valore</H3>
      <P>
        Rispondi a "cosa faccio e per chi?" già nella primissima riga. Per esempio:
      </P>
      <UL>
        <li>❌ "Ciao, sono Giulia. Adoro cucinare."</li>
        <li>✅ "Ricette sane pronte in 20 minuti. 🍅"</li>
      </UL>

      <H3>3. Un dettaglio che dà credibilità</H3>
      <P>
        Aggiungi un dettaglio che crea fiducia: "10K+ follower delle ricette", "Food writer", "Diplomata al Cordon Bleu".
        Una prova del perché qualcuno dovrebbe seguirti.
      </P>

      <H3>4. Dividila con le emoji</H3>
      <P>
        Le emoji funzionano come <strong>separatori</strong>: triplicano la leggibilità. Da tre a cinque è il punto giusto.
      </P>
      <Callout tone="info" title="La formula delle emoji">
        📍 Posizione · 🎯 Cosa faccio · 📩 Come contattarmi · 👇 Tocca il link qui sotto. Queste quattro emoji da sole
        ti danno uno scheletro di bio completo.
      </Callout>

      <H3>5. Una freccia che spinge all'azione (CTA)</H3>
      <P>
        Chiudi sempre la bio indicando il link con <strong>un'emoji freccia</strong> (👇 o 🔗). Per il design stesso di
        Instagram, il link si trova subito sotto la bio; la freccia è un innesco psicologico del tipo "guarda in basso".
      </P>

      <H3>6. Un link, tutte le tue destinazioni</H3>
      <P>
        In quell'unico slot per il link della bio, metti una <A href="/blog/what-is-link-in-bio">pagina link in bio</A>{' '}
        invece di puntare dritto a un solo prodotto o sito. Così:
      </P>
      <UL>
        <li>YouTube, TikTok, Spotify, negozio, blog: li raccogli tutti in un'unica pagina</li>
        <li>Puoi aggiungere una nuova campagna senza mai toccare la tua bio Instagram</li>
        <li>Puoi vedere quale link riceve più clic (statistiche)</li>
      </UL>

      <InlineCta
        title="Usa BeyLink per il link della tua bio Instagram"
        desc="Gratis. Pronto in cinque minuti. Analisi dei clic inclusa."
        href="/register"
        label="Inizia ora →"
      />

      <H3>7. Scegli una categoria</H3>
      <P>
        Nel tuo profilo Instagram puoi scegliere una <strong>categoria aziendale</strong> (Impostazioni {'>'} Tipo di
        account): "Artista", "Food Blog", "Fotografo" e così via. Questo aiuta Instagram a consigliarti agli utenti giusti.
      </P>

      <H3>8. Pulsanti di contatto</H3>
      <P>
        Su un account Instagram Business/Creator puoi aggiungere i pulsanti "E-mail", "Chiama" e "Indicazioni". Inseriscili
        dove servono, così non devi scrivere la tua e-mail nella bio.
      </P>

      <H3>9. Storie in evidenza</H3>
      <P>
        I colori e i titoli delle piccole copertine delle tue storie in evidenza, subito sotto la bio, fanno parte anche
        loro della bio. Scegli un tema coerente: cinque copertine, titoli di cinque parole.
      </P>

      <H3>10. Testa, misura, rinnova</H3>
      <P>
        Tieni la bio invariata per due settimane, poi cambia una riga. Confronta la crescita dei follower e i clic sul
        link con il periodo precedente. L'ottimizzazione è sempre guidata dai dati.
      </P>

      <H2>Formule di bio d'esempio (copia e adatta)</H2>
      <P>Ecco degli scheletri pronti per diversi settori:</P>

      <H3>Creator</H3>
      <Callout>
        📸 Fotografo | Milano<br />
        🎯 Foto street e documentaristica<br />
        📚 5.000+ studenti<br />
        👇 Portfolio e corsi
      </Callout>

      <H3>Ristorante / caffè</H3>
      <Callout>
        🍔 Navigli | Dal 2018<br />
        🌱 Burger 100% vegan<br />
        🕒 12:00-23:00 · 7 giorni<br />
        📍 Menu + prenotazioni 👇
      </Callout>

      <H3>Freelance / consulente</H3>
      <Callout>
        🎨 Brand e Web Design<br />
        🏆 6 anni · 50+ brand<br />
        💬 Call conoscitiva gratuita<br />
        👇 Portfolio + contatti
      </Callout>

      <H3>Brand personale</H3>
      <Callout>
        💼 Direttrice Marketing<br />
        📚 Esperta di crescita SaaS<br />
        🎙️ Podcast "Growth Talks"<br />
        👇 Articoli, corsi, contatti
      </Callout>

      <H2>Errori frequenti</H2>
      <OL>
        <li><strong>Voler riempire tutti i 150 caratteri:</strong> lasciare spazio bianco migliora la leggibilità.</li>
        <li><strong>Hobby senza proposta di valore:</strong> "Cibo, libri, gatti" non è una bio, è un hashtag.</li>
        <li><strong>Restare statici:</strong> la stessa bio da sei mesi? Significa che hai qualcosa di nuovo da dire, quindi aggiornala.</li>
        <li><strong>Scrivere una e-mail invece di un link:</strong> su Instagram le e-mail non si toccano, si copiano. CTA debole.</li>
        <li><strong>Troppi hashtag:</strong> gli hashtag nella bio non compaiono nei risultati di ricerca; sono solo rumore visivo.</li>
      </OL>

      <H2>In sintesi: la tua bio è un benvenuto digitale</H2>
      <P>
        La tua bio Instagram è la tua prima impressione. Non stai vendendo in 150 caratteri, stai <strong>scambiando
        interesse con curiosità</strong>. La vera conversione avviene quando quel visitatore incuriosito tocca e arriva
        alla tua pagina link in bio. Ottimizza la bio una volta, prepara anche la tua pagina <A href="/register">BeyLink</A>,
        e trasformare i follower in clienti diventerà molto più facile.
      </P>
    </>
  );
}

function PostJa() {
  return (
    <>
      <P>
        Instagramのプロフィールは、あなたのデジタルなショーウィンドウです。訪問者はプロフィールを開いてから3秒のうちに、
        <strong>あなたをフォローするかどうかを決めています</strong>。では、150文字でどう心をつかむのか。このガイドでは、
        フォロワーを顧客に変える10の法則と、実例に裏づけられたプロフィールの型を紹介します。
      </P>

      <H2>Instagramのプロフィールはなぜそれほど重要なのか？</H2>
      <P>
        Metaの2024年のデータによると、<strong>訪問者の70%が、プロフィールカードを見てから5秒以内にフォローするかどうかを決めています</strong>。
        その5秒のうち3秒を、プロフィール文を読むことに使っているのです。だからあなたのプロフィールは、次のことをしなければなりません。
      </P>
      <UL>
        <li>あなたが何者かを一文で伝える</li>
        <li>あなたが生み出す価値を示す</li>
        <li>次の一歩を明示する（リンクをタップ、DMを送る、フォローを押す）</li>
      </UL>

      <H2>最適化されたプロフィールを書く10の法則</H2>

      <H3>1. 名前欄をSEOに使う</H3>
      <P>
        ユーザーネーム（@username）は固定ですが、<strong>名前欄</strong>はInstagramの検索対象になります。「田中さくら」ではなく、
        「田中さくら | お菓子レシピ」と書きましょう。人々が「お菓子レシピ」と検索したとき、あなたのアカウントが浮かび上がります。
      </P>

      <H3>2. 1行目：あなたの価値提案</H3>
      <P>
        いちばん最初の行で「私は何を、誰のために作っているのか」に答えましょう。たとえば、
      </P>
      <UL>
        <li>❌「こんにちは、さくらです。料理が好きです。」</li>
        <li>✅「20分で作れるヘルシーレシピを発信中。🍅」</li>
      </UL>

      <H3>3. 信頼を裏づける一言</H3>
      <P>
        信頼につながる一言を添えましょう。「レシピ系フォロワー10K+」「料理ライター」「Cordon Bleu卒業」など。
        なぜフォローすべきなのかの証拠です。
      </P>

      <H3>4. 絵文字で区切る</H3>
      <P>
        絵文字は<strong>区切り</strong>のように働き、読みやすさを3倍にします。3〜5個がちょうどよい数です。
      </P>
      <Callout tone="info" title="絵文字の型">
        📍 場所 · 🎯 何をしているか · 📩 連絡方法 · 👇 下のリンクをタップ。この4つの絵文字だけで、
        プロフィールの骨組みが完成します。
      </Callout>

      <H3>5. 行動を促す矢印（CTA）</H3>
      <P>
        プロフィールの締めには、必ず<strong>矢印の絵文字</strong>（👇 や 🔗）でリンクを指し示しましょう。Instagram自体の設計上、
        リンクはプロフィールのすぐ下にあります。矢印は「下を見て」という心理的なトリガーになります。
      </P>

      <H3>6. リンクは1つ、行き先はすべて</H3>
      <P>
        その1つしかないプロフィールのリンク枠には、1つの商品やサイトに直接飛ばすのではなく、
        <A href="/blog/what-is-link-in-bio">プロフィールリンクのページ</A>を置きましょう。そうすれば、
      </P>
      <UL>
        <li>YouTube、TikTok、Spotify、ショップ、ブログを、すべて1ページにまとめられる</li>
        <li>Instagramのプロフィールを一切触らずに、新しいキャンペーンを追加できる</li>
        <li>どのリンクがいちばんクリックされているかがわかる（アナリティクス）</li>
      </UL>

      <InlineCta
        title="InstagramのプロフィールリンクにBeyLinkを使う"
        desc="無料。5分でセットアップ。クリック分析つき。"
        href="/register"
        label="はじめる →"
      />

      <H3>7. カテゴリーを選ぶ</H3>
      <P>
        Instagramのプロフィールでは<strong>ビジネスカテゴリー</strong>を選べます（設定 {'>'} アカウントの種類）。
        「アーティスト」「料理ブログ」「フォトグラファー」など。これにより、Instagramがあなたを適切なユーザーにおすすめしやすくなります。
      </P>

      <H3>8. 連絡ボタン</H3>
      <P>
        Instagramのビジネス/クリエイターアカウントでは、「メール」「電話」「経路」のボタンを追加できます。
        合う場所に配置すれば、プロフィール文にメールアドレスを書き出す必要がなくなります。
      </P>

      <H3>9. ストーリーズのハイライト</H3>
      <P>
        プロフィールのすぐ下にあるストーリーズのハイライトの小さなカバー画像は、その色やタイトルもプロフィールの一部です。
        統一感のあるテーマを選びましょう。カバー5つ、タイトルは5語で。
      </P>

      <H3>10. テストし、計測し、更新する</H3>
      <P>
        プロフィールを2週間そのままにし、それから1行だけ変えてみましょう。フォロワーの伸びとリンクのクリック数を前の期間と比べます。
        最適化はつねにデータに導かれて行うものです。
      </P>

      <H2>プロフィールの型の例（コピーして応用）</H2>
      <P>さまざまな業種向けの、すぐ使える骨組みがこちらです。</P>

      <H3>クリエイター</H3>
      <Callout>
        📸 フォトグラファー | 東京<br />
        🎯 ストリート＆ドキュメンタリー写真<br />
        📚 受講生5,000人以上<br />
        👇 ポートフォリオと講座
      </Callout>

      <H3>レストラン / カフェ</H3>
      <Callout>
        🍔 下北沢 | 2018年から<br />
        🌱 100%ヴィーガンバーガー<br />
        🕒 12:00〜23:00 · 年中無休<br />
        📍 メニュー + 予約 👇
      </Callout>

      <H3>フリーランス / コンサルタント</H3>
      <Callout>
        🎨 ブランド＆Webデザイン<br />
        🏆 6年 · 50ブランド以上<br />
        💬 無料の初回相談<br />
        👇 ポートフォリオ + 連絡先
      </Callout>

      <H3>個人ブランド</H3>
      <Callout>
        💼 マーケティングディレクター<br />
        📚 SaaSグロースの専門家<br />
        🎙️ ポッドキャスト「Growth Talks」<br />
        👇 記事、講座、連絡先
      </Callout>

      <H2>よくある失敗</H2>
      <OL>
        <li><strong>150文字を埋めようとする：</strong>余白を残すほうが読みやすくなります。</li>
        <li><strong>価値提案のない趣味の羅列：</strong>「料理、本、猫」はプロフィールではなく、ただのハッシュタグです。</li>
        <li><strong>ずっと固定のまま：</strong>半年間ずっと同じプロフィール？ それは新しく伝えることがあるということ。更新しましょう。</li>
        <li><strong>リンクの代わりにメールを書く：</strong>Instagramではメールはタップされず、コピーされるだけ。弱いCTAです。</li>
        <li><strong>ハッシュタグの入れすぎ：</strong>プロフィール内のハッシュタグは検索結果に出ず、見た目のノイズになるだけです。</li>
      </OL>

      <H2>まとめ：プロフィールはデジタルのあいさつ</H2>
      <P>
        Instagramのプロフィールは、あなたの第一印象です。150文字で売るのではなく、<strong>興味を好奇心に変えている</strong>のです。
        本当のコンバージョンは、好奇心を持った訪問者がタップして、あなたのプロフィールリンクのページに進んだときに起こります。
        プロフィールを一度最適化し、<A href="/register">BeyLink</A>のページも用意すれば、フォロワーを顧客に変えるのはずっと簡単になります。
      </P>
    </>
  );
}

export default function Post() {
  const { lang } = useLanguage();
  return lang === 'ja' ? <PostJa /> : lang === 'it' ? <PostIt /> : lang === 'pt' ? <PostPt /> : lang === 'fr' ? <PostFr /> : lang === 'de' ? <PostDe /> : lang === 'ru' ? <PostRu /> : lang === 'es' ? <PostEs /> : lang === 'en' ? <PostEn /> : <PostTr />;
}
