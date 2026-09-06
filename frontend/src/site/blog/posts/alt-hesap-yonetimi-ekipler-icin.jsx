import { H2, H3, P, UL, OL, A, Callout, InlineCta } from '../PostBody.jsx';
import { useLanguage } from '../../../context/LanguageContext.jsx';

export const meta = {
  slug: 'sub-account-management',
  title: {
    tr: 'Alt Hesap Yönetimi: Ajans ve Ekipler için Rehber',
    en: 'Sub-Account Management: A Guide for Agencies & Teams',
    ru: 'Управление субаккаунтами: гид для агентств и команд',
    es: 'Gestión de subcuentas: guía para agencias y equipos',
    de: 'Unterkonten verwalten: Guide für Agenturen und Teams',
    fr: 'Gérer les sous-comptes : guide agences et équipes',
    pt: 'Gestão de subcontas: guia para agências e equipes',
    it: 'Gestione account secondari: guida per agenzie e team',
    ja: 'サブアカウント管理：代理店・チームのためのガイド',
  },
  description: {
    tr: 'Müşteri veya ekip üyelerin için ayrı biolink profilleri nasıl yönetilir? İzinler, toplu tasarım uygulama, faturalama.',
    en: 'How do you manage separate biolink profiles for clients or team members? Permissions, bulk design apply, and billing.',
    ru: 'Как управлять отдельными профилями ссылки в био для клиентов или членов команды? Права доступа, массовое применение дизайна и оплата.',
    es: '¿Cómo gestionar perfiles link in bio separados para clientes o miembros del equipo? Permisos, aplicación masiva de diseño y facturación.',
    de: 'Wie verwaltest du separate Bio-Link-Profile für Kunden oder Teammitglieder? Berechtigungen, Design-Massenanwendung und Abrechnung.',
    fr: 'Comment gérer des profils de lien en bio distincts pour des clients ou des membres d\'équipe ? Permissions, application groupée du design et facturation.',
    pt: 'Como gerenciar perfis de link na bio separados para clientes ou membros da equipe? Permissões, aplicação de design em massa e cobrança.',
    it: 'Come gestire profili link in bio separati per clienti o membri del team? Permessi, applicazione del design in blocco e fatturazione.',
    ja: 'クライアントやチームメンバーごとに別々のプロフィールリンクをどう管理する？権限設定、デザインの一括適用、請求までを解説します。',
  },
  category: 'yaraticilar',
  tags: {
    tr: ['ekip', 'ajans', 'alt hesap', 'yönetim'],
    en: ['team', 'agency', 'sub-account', 'management'],
    ru: ['команда', 'агентство', 'субаккаунт', 'управление'],
    es: ['equipo', 'agencia', 'subcuenta', 'gestión'],
    de: ['team', 'agentur', 'unterkonto', 'verwaltung'],
    fr: ['équipe', 'agence', 'sous-compte', 'gestion'],
    pt: ['equipe', 'agência', 'subconta', 'gestão'],
    it: ['team', 'agenzia', 'account secondari', 'gestione'],
    ja: ['チーム', '代理店', 'サブアカウント', '管理'],
  },
  publishedAt: '2026-07-07',
  updatedAt: '2026-07-07',
  readingMinutes: 5,
  image: '/og-image.png',
  faq: {
    tr: [
      { q: 'Alt hesap nedir?', a: 'Ana hesabına bağlı, senin kontrol edebildiğin ama başkasının (müşteri/ekip üyesi) sadece kendi profilini görebildiği ayrı hesaplardır. Ajanslar ve ekip liderleri için idealdir.' },
      { q: 'Kaç alt hesap açabilirim?', a: 'Free 0, Basic 1, Pro 3 (max 10), Pro Plus 15 (max 40). Paketlerle daha fazlasına çıkarabilirsin. Detaylar fiyatlandırma sayfasında.' },
      { q: 'Alt hesap şablonu toplu uygulanabilir mi?', a: 'Pro Plus planında bir tasarım şablonunu tüm alt hesap profillerine tek tıkla uygulayabilirsin. Ekip tutarlılığı için mükemmel.' },
    ],
    en: [
      { q: 'What is a sub-account?', a: 'A separate account linked to your main account that you control, but where the other person (client/team member) can only see their own profile. It\'s ideal for agencies and team leads.' },
      { q: 'How many sub-accounts can I create?', a: 'Free 0, Basic 1, Pro 3 (max 10), Pro Plus 15 (max 40). You can go higher with add-on packs. Details are on the pricing page.' },
      { q: 'Can a template be applied to sub-accounts in bulk?', a: 'On the Pro Plus plan you can apply a design template to all sub-account profiles in one click. Perfect for team consistency.' },
    ],
    ru: [
      { q: 'Что такое субаккаунт?', a: 'Это отдельный аккаунт, привязанный к вашему основному, которым управляете вы, но где другой человек (клиент/член команды) видит только свой профиль. Идеально для агентств и руководителей команд.' },
      { q: 'Сколько субаккаунтов можно создать?', a: 'Free 0, Basic 1, Pro 3 (макс 10), Pro Plus 15 (макс 40). Больше можно добавить с помощью дополнительных пакетов. Детали на странице тарифов.' },
      { q: 'Можно ли применить шаблон к субаккаунтам массово?', a: 'На плане Pro Plus можно применить шаблон дизайна ко всем профилям субаккаунтов в один клик. Идеально для единообразия команды.' },
    ],
    es: [
      { q: '¿Qué es una subcuenta?', a: 'Es una cuenta independiente vinculada a tu cuenta principal que tú controlas, pero donde la otra persona (cliente/miembro del equipo) solo ve su propio perfil. Es ideal para agencias y responsables de equipo.' },
      { q: '¿Cuántas subcuentas puedo crear?', a: 'Free 0, Basic 1, Pro 3 (máx. 10), Pro Plus 15 (máx. 40). Puedes subir más con paquetes adicionales. Los detalles están en la página de precios.' },
      { q: '¿Se puede aplicar una plantilla a las subcuentas de forma masiva?', a: 'En el plan Pro Plus puedes aplicar una plantilla de diseño a todos los perfiles de subcuenta con un solo clic. Perfecto para la coherencia del equipo.' },
    ],
    de: [
      { q: 'Was ist ein Unterkonto?', a: 'Ein mit deinem Hauptkonto verknüpftes, separates Konto, das du steuerst, bei dem die andere Person (Kunde/Teammitglied) aber nur das eigene Profil sieht. Ideal für Agenturen und Teamleitungen.' },
      { q: 'Wie viele Unterkonten kann ich erstellen?', a: 'Free 0, Basic 1, Pro 3 (max. 10), Pro Plus 15 (max. 40). Mit Zusatzpaketen kannst du höher gehen. Details findest du auf der Preisseite.' },
      { q: 'Kann eine Vorlage in großer Menge auf Unterkonten angewendet werden?', a: 'Im Pro-Plus-Tarif kannst du eine Design-Vorlage mit einem Klick auf alle Unterkonto-Profile anwenden. Perfekt für Team-Konsistenz.' },
    ],
    fr: [
      { q: 'Qu\'est-ce qu\'un sous-compte ?', a: 'C\'est un compte distinct rattaché à votre compte principal, que vous contrôlez, mais où l\'autre personne (client/membre d\'équipe) ne voit que son propre profil. Idéal pour les agences et les responsables d\'équipe.' },
      { q: 'Combien de sous-comptes puis-je créer ?', a: 'Free 0, Basic 1, Pro 3 (max 10), Pro Plus 15 (max 40). Vous pouvez aller plus haut avec des packs supplémentaires. Les détails sont sur la page tarifs.' },
      { q: 'Un modèle peut-il être appliqué en masse aux sous-comptes ?', a: 'Avec le forfait Pro Plus, vous pouvez appliquer un modèle de design à tous les profils de sous-compte en un clic. Parfait pour la cohérence de l\'équipe.' },
    ],
    pt: [
      { q: 'O que é uma subconta?', a: 'É uma conta separada, vinculada à sua conta principal, que você controla, mas onde a outra pessoa (cliente/membro da equipe) só vê o próprio perfil. É ideal para agências e líderes de equipe.' },
      { q: 'Quantas subcontas posso criar?', a: 'Gratuito 0, Básico 1, Pro 3 (máx. 10), Pro Plus 15 (máx. 40). Você pode ir além com pacotes adicionais. Os detalhes estão na página de preços.' },
      { q: 'Dá para aplicar um template às subcontas em massa?', a: 'No plano Pro Plus você pode aplicar um template de design a todos os perfis de subconta com um clique. Perfeito para a consistência da equipe.' },
    ],
    it: [
      { q: 'Cos\'è un account secondario?', a: 'È un account separato collegato al tuo account principale, che controlli tu, ma in cui l\'altra persona (cliente/membro del team) vede solo il proprio profilo. È ideale per agenzie e team leader.' },
      { q: 'Quanti account secondari posso creare?', a: 'Gratuito 0, Base 1, Pro 3 (max 10), Pro Plus 15 (max 40). Puoi salire con i pacchetti aggiuntivi. I dettagli sono nella pagina dei prezzi.' },
      { q: 'Un template può essere applicato agli account secondari in blocco?', a: 'Con il piano Pro Plus puoi applicare un template di design a tutti i profili degli account secondari con un clic. Perfetto per la coerenza del team.' },
    ],
    ja: [
      { q: 'サブアカウントとは何ですか？', a: 'メインアカウントに紐づいた別々のアカウントで、あなたが管理しますが、相手（クライアントやチームメンバー）は自分のプロフィールしか見られません。代理店やチームリーダーに最適です。' },
      { q: 'サブアカウントはいくつ作れますか？', a: '無料0、ベーシック1、Pro3（最大10）、Pro Plus15（最大40）です。追加パックでさらに増やせます。詳しくは料金ページをご覧ください。' },
      { q: 'テンプレートをサブアカウントに一括で適用できますか？', a: 'Pro Plusプランなら、デザインテンプレートをすべてのサブアカウントのプロフィールにワンクリックで適用できます。チームの統一感に最適です。' },
    ],
  },
};

function PostTr() {
  return (
    <>
      <P>
        Bir ajans işletiyorsun ya da ekibin var. Herkes için ayrı BeyLink hesabı açmak yerine <strong>alt hesap</strong>{' '}
        özelliğini kullanabilirsin. Bu rehberde alt hesap yönetimi ve gerçek dünya kullanım senaryolarını anlattık.
      </P>

      <H2>Alt hesap mantığı</H2>
      <P>
        Ana hesabın altında birden çok alt hesap açarsın. Her alt hesap:
      </P>
      <UL>
        <li>Kendi kullanıcı adı ve şifresiyle giriş yapar</li>
        <li>Kendi public profil URL'i vardır</li>
        <li>Sadece kendi profilini görür (diğer alt hesapları göremez)</li>
        <li>Sen ana hesap olarak hepsini tek panelden yönetirsin</li>
      </UL>

      <H2>Kimler için ideal?</H2>

      <H3>1. Dijital ajanslar</H3>
      <P>
        10 müşterinin var, her birine biolink hizmeti veriyorsun. 10 farklı hesap yerine 1 Pro Plus hesabıyla hepsini
        yönet. Faturalama tek yerden, tasarım güncellemeleri toplu.
      </P>

      <H3>2. Restoran zincirleri</H3>
      <P>
        Aynı markanın 5 şubesi var. Her şubenin ayrı biolink sayfası olsun ama tasarım/marka tutarlı kalsın. Ana hesabından
        şablon değiştirdiğinde tümüne toplu uygulayabilirsin (Pro Plus).
      </P>

      <H3>3. Content creator ekipleri</H3>
      <P>
        4 kişilik bir content ekibin var. Her biri ayrı sosyal medya profili yönetiyor. Ekip üyesi kendi profilini
        güncellesin, ama analytics'i sen görsün.
      </P>

      <H3>4. Emlak ofisleri</H3>
      <P>
        20 danışmanlı bir ofissin. Her danışmanın ayrı biolink kartı (ilanları, iletişimi) olsun. Ofis logosu ve
        renkler tutarlı, danışman bilgileri kişisel.
      </P>

      <InlineCta
        title="Ekibin için Pro Plus"
        desc="15 ekip üyesi (max 40), toplu şablon uygulama, alt hesap yönetimi — $40/ay."
        href="/pricing"
        label="Pro Plus'ı İncele →"
      />

      <H2>Alt hesap yönetimi (özellikler)</H2>

      <H3>Yetki yönetimi</H3>
      <P>
        Her alt hesap için:
      </P>
      <UL>
        <li>Profil düzenleme izni açık/kapalı</li>
        <li>Aktif/pasif toggle (istemediğin zaman geçici olarak durdur)</li>
        <li>Şifre sıfırlama</li>
      </UL>

      <H3>Toplu şablon uygulama (Pro Plus)</H3>
      <P>
        Bir tasarım şablonunu Şablonlarım'a kaydet, sonra "Alt Hesaplara Toplu Uygula" ile 15 alt hesabın tamamına
        tek tıkla uygula. Ekip tutarlılığı için altın değerinde.
      </P>

      <H3>Premium yaşam döngüsü</H3>
      <P>
        Premium'un biterse alt hesaplar otomatik "askıya" alınır (silinmez). Yenileme yaptığında onaylayarak toplu
        aktifleştirebilirsin. Verilerin güvende, sadece geçici pasif.
      </P>

      <H2>Faturalama modeli</H2>
      <P>
        Alt hesaplar için ayrı ödeme yok. Ana hesabından tek Pro Plus planı ($40/ay) tüm alt hesaplarını kapsar.
        Fazla alt hesap ihtiyacın olursa +paket satın alarak 40'a çıkabilirsin.
      </P>

      <Callout tone="success" title="Ajans için kâr hesabı">
        10 müşteriye biolink hizmeti veriyorsun, aylık $20 alıyorsun. Toplam $200 gelir. Pro Plus $40 → net kâr $160.
        Marketing bütçesi olmayan küçük ajans için mükemmel gelir kanalı.
      </Callout>

      <H2>Sonuç</H2>
      <P>
        Alt hesap sadece "birden çok hesap yönetme" değil — <strong>ekibin ya da müşterin için ölçeklenebilir bir sistem</strong>.
        Ajanslar, restoran zincirleri, content ekipleri ve emlak ofisleri için pratik ve kârlı bir çözüm.
      </P>
      <P>
        <A href="/pricing">Pro Plus paketini incele</A>, ilk alt hesabını aç, ekibin için biolink deneyimini
        büyüt.
      </P>
    </>
  );
}

function PostEn() {
  return (
    <>
      <P>
        You run an agency or you have a team. Instead of opening a separate BeyLink account for everyone, you can use
        the <strong>sub-account</strong>{' '}
        feature. In this guide we cover sub-account management and real-world use cases.
      </P>

      <H2>How sub-accounts work</H2>
      <P>
        You open multiple sub-accounts under your main account. Each sub-account:
      </P>
      <UL>
        <li>Logs in with its own username and password</li>
        <li>Has its own public profile URL</li>
        <li>Only sees its own profile (it can't see the other sub-accounts)</li>
        <li>Is managed by you, the owner, from a single panel</li>
      </UL>

      <H2>Who is it ideal for?</H2>

      <H3>1. Digital agencies</H3>
      <P>
        You have 10 clients and provide each of them with a biolink service. Instead of 10 separate accounts, manage
        them all with one Pro Plus account. Billing in one place, design updates in bulk.
      </P>

      <H3>2. Restaurant chains</H3>
      <P>
        The same brand has 5 locations. Give each branch its own biolink page while keeping the design and brand
        consistent. When you change the template from your main account, you can apply it to all of them in bulk (Pro
        Plus).
      </P>

      <H3>3. Content creator teams</H3>
      <P>
        You have a 4-person content team. Each one manages a separate social media profile. Let a team member update
        their own profile, while you see the analytics.
      </P>

      <H3>4. Real estate offices</H3>
      <P>
        You're an office with 20 agents. Give each agent their own biolink card (listings, contact info). The office
        logo and colors stay consistent, while each agent's details are personal.
      </P>

      <InlineCta
        title="Pro Plus for your team"
        desc="15 team members (max 40), bulk template apply, sub-account management, all for $40/month."
        href="/pricing"
        label="Explore Pro Plus →"
      />

      <H2>Sub-account management (features)</H2>

      <H3>Permission management</H3>
      <P>
        For each sub-account:
      </P>
      <UL>
        <li>Profile editing permission on/off</li>
        <li>Active/inactive toggle (pause it temporarily whenever you want)</li>
        <li>Password reset</li>
      </UL>

      <H3>Bulk template apply (Pro Plus)</H3>
      <P>
        Save a design template to My Templates, then use "Apply to Sub-Accounts in Bulk" to apply it to all 15
        sub-accounts in one click. Golden for team consistency.
      </P>

      <H3>Premium lifecycle</H3>
      <P>
        If your premium expires, sub-accounts are automatically "suspended" (not deleted). When you renew, you can
        reactivate them all in bulk with your approval. Your data is safe, just temporarily inactive.
      </P>

      <H2>Billing model</H2>
      <P>
        There's no separate payment for sub-accounts. A single Pro Plus plan ($40/month) on your main account covers
        all your sub-accounts. If you need more sub-accounts, you can go up to 40 by buying add-on packs.
      </P>

      <Callout tone="success" title="Profit math for an agency">
        You provide a biolink service to 10 clients at $20/month each. That's $200 in total revenue. Pro Plus is $40 →
        net profit of $160. A perfect revenue channel for a small agency with no marketing budget.
      </Callout>

      <H2>Conclusion</H2>
      <P>
        A sub-account isn't just "managing multiple accounts"; it's <strong>a scalable system for your team or your
        clients</strong>.
        A practical and profitable solution for agencies, restaurant chains, content teams, and real estate offices.
      </P>
      <P>
        <A href="/pricing">Explore the Pro Plus plan</A>, open your first sub-account, and grow the biolink
        experience for your team.
      </P>
    </>
  );
}

function PostRu() {
  return (
    <>
      <P>
        Вы управляете агентством или у вас есть команда. Вместо того чтобы открывать отдельный аккаунт BeyLink для
        каждого, вы можете использовать функцию <strong>субаккаунтов</strong>{' '}
        В этом руководстве мы разберём управление субаккаунтами и реальные сценарии использования.
      </P>

      <H2>Как работают субаккаунты</H2>
      <P>
        Вы открываете несколько субаккаунтов под своим основным аккаунтом. Каждый субаккаунт:
      </P>
      <UL>
        <li>Входит со своим именем пользователя и паролем</li>
        <li>Имеет свой публичный URL профиля</li>
        <li>Видит только свой профиль (он не видит другие субаккаунты)</li>
        <li>Управляется вами, владельцем, из единой панели</li>
      </UL>

      <H2>Кому это идеально подходит?</H2>

      <H3>1. Цифровые агентства</H3>
      <P>
        У вас 10 клиентов, и каждому вы предоставляете услугу ссылки в био. Вместо 10 отдельных аккаунтов управляйте ими
        всеми через один аккаунт Pro Plus. Оплата в одном месте, обновления дизайна массово.
      </P>

      <H3>2. Сети ресторанов</H3>
      <P>
        У одного бренда 5 точек. Дайте каждому филиалу свою страницу ссылки в био, сохраняя дизайн и бренд едиными. Когда
        вы меняете шаблон в основном аккаунте, вы можете применить его ко всем массово (Pro Plus).
      </P>

      <H3>3. Команды авторов контента</H3>
      <P>
        У вас команда контента из 4 человек. Каждый ведёт отдельный профиль в соцсетях. Пусть член команды обновляет свой
        профиль, а вы видите аналитику.
      </P>

      <H3>4. Офисы недвижимости</H3>
      <P>
        Вы офис с 20 агентами. Дайте каждому агенту свою карточку ссылки в био (объявления, контакты). Логотип и цвета
        офиса остаются едиными, а данные каждого агента персональны.
      </P>

      <InlineCta
        title="Pro Plus для вашей команды"
        desc="15 членов команды (макс 40), массовое применение шаблона, управление субаккаунтами, всё за $40/месяц."
        href="/pricing"
        label="Изучить Pro Plus →"
      />

      <H2>Управление субаккаунтами (возможности)</H2>

      <H3>Управление правами</H3>
      <P>
        Для каждого субаккаунта:
      </P>
      <UL>
        <li>Право редактирования профиля вкл/выкл</li>
        <li>Переключатель активен/неактивен (приостановите его на время, когда захотите)</li>
        <li>Сброс пароля</li>
      </UL>

      <H3>Массовое применение шаблона (Pro Plus)</H3>
      <P>
        Сохраните шаблон дизайна в «Мои шаблоны», затем через «Применить к субаккаунтам массово» примените его ко всем 15
        субаккаунтам в один клик. Бесценно для единообразия команды.
      </P>

      <H3>Жизненный цикл премиума</H3>
      <P>
        Если ваш премиум истекает, субаккаунты автоматически «приостанавливаются» (не удаляются). Когда вы продлеваете, вы
        можете реактивировать их все массово с вашего одобрения. Ваши данные в безопасности, просто временно неактивны.
      </P>

      <H2>Модель оплаты</H2>
      <P>
        Отдельной оплаты за субаккаунты нет. Один план Pro Plus ($40/месяц) на вашем основном аккаунте покрывает все ваши
        субаккаунты. Если нужно больше субаккаунтов, вы можете дойти до 40, купив дополнительные пакеты.
      </P>

      <Callout tone="success" title="Расчёт прибыли для агентства">
        Вы предоставляете услугу ссылки в био 10 клиентам по $20/месяц каждому. Это $200 общего дохода. Pro Plus стоит $40
        → чистая прибыль $160. Идеальный канал дохода для маленького агентства без маркетингового бюджета.
      </Callout>

      <H2>Заключение</H2>
      <P>
        Субаккаунт это не просто «управление несколькими аккаунтами»; это <strong>масштабируемая система для вашей команды
        или ваших клиентов</strong>.
        Практичное и прибыльное решение для агентств, сетей ресторанов, команд контента и офисов недвижимости.
      </P>
      <P>
        <A href="/pricing">Изучите план Pro Plus</A>, откройте свой первый субаккаунт и развивайте опыт ссылки в
        био для вашей команды.
      </P>
    </>
  );
}

function PostEs() {
  return (
    <>
      <P>
        Diriges una agencia o tienes un equipo. En lugar de abrir una cuenta de BeyLink aparte para cada uno, puedes usar
        la función de <strong>subcuentas</strong>{' '}
        En esta guía cubrimos la gestión de subcuentas y casos de uso reales.
      </P>

      <H2>Cómo funcionan las subcuentas</H2>
      <P>
        Abres varias subcuentas bajo tu cuenta principal. Cada subcuenta:
      </P>
      <UL>
        <li>Inicia sesión con su propio nombre de usuario y contraseña</li>
        <li>Tiene su propia URL de perfil público</li>
        <li>Solo ve su propio perfil (no puede ver las demás subcuentas)</li>
        <li>La gestionas tú, el propietario, desde un único panel</li>
      </UL>

      <H2>¿Para quién es ideal?</H2>

      <H3>1. Agencias digitales</H3>
      <P>
        Tienes 10 clientes y a cada uno le das un servicio de link in bio. En lugar de 10 cuentas separadas, gestiónalas
        todas con una sola cuenta Pro Plus. Facturación en un solo lugar, actualizaciones de diseño de forma masiva.
      </P>

      <H3>2. Cadenas de restaurantes</H3>
      <P>
        La misma marca tiene 5 locales. Dale a cada sucursal su propia página link in bio manteniendo el diseño y la
        marca coherentes. Cuando cambias la plantilla desde tu cuenta principal, puedes aplicarla a todas de forma masiva
        (Pro Plus).
      </P>

      <H3>3. Equipos de creadores de contenido</H3>
      <P>
        Tienes un equipo de contenido de 4 personas. Cada una gestiona un perfil de redes sociales distinto. Deja que un
        miembro del equipo actualice su propio perfil, mientras tú ves la analítica.
      </P>

      <H3>4. Oficinas inmobiliarias</H3>
      <P>
        Eres una oficina con 20 agentes. Dale a cada agente su propia tarjeta link in bio (anuncios, datos de contacto).
        El logotipo y los colores de la oficina se mantienen coherentes, mientras que los datos de cada agente son
        personales.
      </P>

      <InlineCta
        title="Pro Plus para tu equipo"
        desc="15 miembros del equipo (máx. 40), aplicación masiva de plantillas, gestión de subcuentas, todo por $40/mes."
        href="/pricing"
        label="Explorar Pro Plus →"
      />

      <H2>Gestión de subcuentas (funciones)</H2>

      <H3>Gestión de permisos</H3>
      <P>
        Para cada subcuenta:
      </P>
      <UL>
        <li>Permiso de edición del perfil activado/desactivado</li>
        <li>Interruptor activo/inactivo (pausa la subcuenta temporalmente cuando quieras)</li>
        <li>Restablecimiento de contraseña</li>
      </UL>

      <H3>Aplicación masiva de plantillas (Pro Plus)</H3>
      <P>
        Guarda una plantilla de diseño en Mis plantillas y luego, con "Aplicar a subcuentas de forma masiva", aplícala a
        las 15 subcuentas de un solo clic. Oro puro para la coherencia del equipo.
      </P>

      <H3>Ciclo de vida del premium</H3>
      <P>
        Si tu premium caduca, las subcuentas se "suspenden" automáticamente (no se borran). Cuando renuevas, puedes
        reactivarlas todas de forma masiva con tu aprobación. Tus datos están a salvo, solo temporalmente inactivos.
      </P>

      <H2>Modelo de facturación</H2>
      <P>
        No hay un pago aparte por las subcuentas. Un único plan Pro Plus ($40/mes) en tu cuenta principal cubre todas tus
        subcuentas. Si necesitas más subcuentas, puedes llegar hasta 40 comprando paquetes adicionales.
      </P>

      <Callout tone="success" title="Cuentas de beneficio para una agencia">
        Das un servicio de link in bio a 10 clientes a $20/mes cada uno. Eso son $200 de ingresos totales. Pro Plus
        cuesta $40 → un beneficio neto de $160. Un canal de ingresos perfecto para una agencia pequeña sin presupuesto de
        marketing.
      </Callout>

      <H2>Conclusión</H2>
      <P>
        Una subcuenta no es solo "gestionar varias cuentas"; es <strong>un sistema escalable para tu equipo o tus
        clientes</strong>.
        Una solución práctica y rentable para agencias, cadenas de restaurantes, equipos de contenido y oficinas
        inmobiliarias.
      </P>
      <P>
        <A href="/pricing">Explora el plan Pro Plus</A>, abre tu primera subcuenta y haz crecer la experiencia link
        in bio para tu equipo.
      </P>
    </>
  );
}

function PostDe() {
  return (
    <>
      <P>
        Du führst eine Agentur oder hast ein Team. Statt für jeden ein separates BeyLink-Konto zu eröffnen, kannst du die
        <strong> Unterkonto</strong>-Funktion nutzen. In diesem Guide behandeln wir die Verwaltung von Unterkonten und
        Anwendungsfälle aus der Praxis.
      </P>

      <H2>So funktionieren Unterkonten</H2>
      <P>
        Du eröffnest mehrere Unterkonten unter deinem Hauptkonto. Jedes Unterkonto:
      </P>
      <UL>
        <li>Meldet sich mit eigenem Benutzernamen und Passwort an</li>
        <li>Hat seine eigene öffentliche Profil-URL</li>
        <li>Sieht nur sein eigenes Profil (es kann die anderen Unterkonten nicht sehen)</li>
        <li>Wird von dir, dem Inhaber, aus einem einzigen Panel verwaltet</li>
      </UL>

      <H2>Für wen ist es ideal?</H2>

      <H3>1. Digitalagenturen</H3>
      <P>
        Du hast 10 Kunden und bietest jedem davon einen Bio-Link-Service. Statt 10 separater Konten verwaltest du sie alle
        mit einem Pro-Plus-Konto. Abrechnung an einem Ort, Design-Updates in großer Menge.
      </P>

      <H3>2. Restaurantketten</H3>
      <P>
        Dieselbe Marke hat 5 Standorte. Gib jeder Filiale ihre eigene Bio-Link-Seite und halte dabei Design und Marke
        einheitlich. Wenn du die Vorlage vom Hauptkonto aus änderst, kannst du sie auf alle in großer Menge anwenden (Pro
        Plus).
      </P>

      <H3>3. Content-Creator-Teams</H3>
      <P>
        Du hast ein 4-köpfiges Content-Team. Jeder verwaltet ein eigenes Social-Media-Profil. Lass ein Teammitglied sein
        eigenes Profil aktualisieren, während du die Analysen siehst.
      </P>

      <H3>4. Immobilienbüros</H3>
      <P>
        Du bist ein Büro mit 20 Maklern. Gib jedem Makler seine eigene Bio-Link-Karte (Angebote, Kontaktdaten). Logo und
        Farben des Büros bleiben einheitlich, während die Daten jedes Maklers persönlich sind.
      </P>

      <InlineCta
        title="Pro Plus für dein Team"
        desc="15 Teammitglieder (max. 40), Vorlagen-Massenanwendung, Unterkonto-Verwaltung, alles für $40/Monat."
        href="/pricing"
        label="Pro Plus entdecken →"
      />

      <H2>Unterkonto-Verwaltung (Funktionen)</H2>

      <H3>Berechtigungsverwaltung</H3>
      <P>
        Für jedes Unterkonto:
      </P>
      <UL>
        <li>Profilbearbeitungs-Berechtigung an/aus</li>
        <li>Aktiv/Inaktiv-Schalter (pausiere es vorübergehend, wann immer du willst)</li>
        <li>Passwort zurücksetzen</li>
      </UL>

      <H3>Vorlagen-Massenanwendung (Pro Plus)</H3>
      <P>
        Speichere eine Design-Vorlage unter „Meine Vorlagen“ und wende sie dann mit „Auf Unterkonten in großer Menge
        anwenden“ mit einem Klick auf alle 15 Unterkonten an. Goldwert für Team-Konsistenz.
      </P>

      <H3>Premium-Lebenszyklus</H3>
      <P>
        Läuft dein Premium ab, werden Unterkonten automatisch „ausgesetzt“ (nicht gelöscht). Wenn du verlängerst, kannst
        du sie mit deiner Freigabe alle in großer Menge reaktivieren. Deine Daten sind sicher, nur vorübergehend inaktiv.
      </P>

      <H2>Abrechnungsmodell</H2>
      <P>
        Für Unterkonten gibt es keine separate Zahlung. Ein einziger Pro-Plus-Tarif ($40/Monat) auf deinem Hauptkonto
        deckt all deine Unterkonten ab. Brauchst du mehr Unterkonten, kannst du durch den Kauf von Zusatzpaketen bis auf
        40 gehen.
      </P>

      <Callout tone="success" title="Gewinnrechnung für eine Agentur">
        Du bietest 10 Kunden einen Bio-Link-Service für je $20/Monat. Das sind $200 Gesamtumsatz. Pro Plus kostet $40 →
        Nettogewinn von $160. Ein perfekter Umsatzkanal für eine kleine Agentur ohne Marketingbudget.
      </Callout>

      <H2>Fazit</H2>
      <P>
        Ein Unterkonto ist nicht nur „mehrere Konten verwalten“; es ist <strong>ein skalierbares System für dein Team
        oder deine Kunden</strong>.
        Eine praktische und profitable Lösung für Agenturen, Restaurantketten, Content-Teams und Immobilienbüros.
      </P>
      <P>
        <A href="/pricing">Entdecke den Pro-Plus-Tarif</A>, eröffne dein erstes Unterkonto und baue das
        Bio-Link-Erlebnis für dein Team aus.
      </P>
    </>
  );
}

function PostFr() {
  return (
    <>
      <P>
        Vous dirigez une agence ou vous avez une équipe. Au lieu d'ouvrir un compte BeyLink distinct pour chacun, vous
        pouvez utiliser la fonction <strong>sous-compte</strong>{' '}
        Dans ce guide, nous couvrons la gestion des sous-comptes et des cas d'usage concrets.
      </P>

      <H2>Comment fonctionnent les sous-comptes</H2>
      <P>
        Vous ouvrez plusieurs sous-comptes sous votre compte principal. Chaque sous-compte :
      </P>
      <UL>
        <li>Se connecte avec son propre nom d'utilisateur et mot de passe</li>
        <li>Possède sa propre URL de profil public</li>
        <li>Ne voit que son propre profil (il ne peut pas voir les autres sous-comptes)</li>
        <li>Est géré par vous, le propriétaire, depuis un seul panneau</li>
      </UL>

      <H2>Pour qui est-ce idéal ?</H2>

      <H3>1. Les agences numériques</H3>
      <P>
        Vous avez 10 clients et vous fournissez à chacun un service de lien en bio. Au lieu de 10 comptes distincts,
        gérez-les tous avec un seul compte Pro Plus. Facturation au même endroit, mises à jour du design en masse.
      </P>

      <H3>2. Les chaînes de restaurants</H3>
      <P>
        La même marque a 5 établissements. Donnez à chaque succursale sa propre page de lien en bio tout en gardant le
        design et la marque cohérents. Quand vous changez le modèle depuis votre compte principal, vous pouvez l'appliquer
        à toutes en masse (Pro Plus).
      </P>

      <H3>3. Les équipes de créateurs de contenu</H3>
      <P>
        Vous avez une équipe de contenu de 4 personnes. Chacune gère un profil de réseau social distinct. Laissez un
        membre de l'équipe mettre à jour son propre profil, pendant que vous voyez les statistiques.
      </P>

      <H3>4. Les agences immobilières</H3>
      <P>
        Vous êtes une agence de 20 conseillers. Donnez à chaque conseiller sa propre carte de lien en bio (annonces,
        coordonnées). Le logo et les couleurs de l'agence restent cohérents, tandis que les informations de chaque
        conseiller sont personnelles.
      </P>

      <InlineCta
        title="Pro Plus pour votre équipe"
        desc="15 membres d'équipe (max 40), application groupée de modèles, gestion des sous-comptes, le tout pour $40/mois."
        href="/pricing"
        label="Découvrir Pro Plus →"
      />

      <H2>Gestion des sous-comptes (fonctionnalités)</H2>

      <H3>Gestion des permissions</H3>
      <P>
        Pour chaque sous-compte :
      </P>
      <UL>
        <li>Permission de modification du profil activée/désactivée</li>
        <li>Bascule actif/inactif (mettez-le en pause temporairement quand vous voulez)</li>
        <li>Réinitialisation du mot de passe</li>
      </UL>

      <H3>Application groupée de modèles (Pro Plus)</H3>
      <P>
        Enregistrez un modèle de design dans Mes modèles, puis via « Appliquer aux sous-comptes en masse », appliquez-le
        aux 15 sous-comptes en un clic. En or pour la cohérence de l'équipe.
      </P>

      <H3>Cycle de vie du premium</H3>
      <P>
        Si votre premium expire, les sous-comptes sont automatiquement « suspendus » (pas supprimés). Quand vous
        renouvelez, vous pouvez les réactiver tous en masse avec votre approbation. Vos données sont en sécurité,
        seulement temporairement inactives.
      </P>

      <H2>Le modèle de facturation</H2>
      <P>
        Il n'y a pas de paiement distinct pour les sous-comptes. Un seul forfait Pro Plus ($40/mois) sur votre compte
        principal couvre tous vos sous-comptes. Si vous avez besoin de plus de sous-comptes, vous pouvez monter jusqu'à
        40 en achetant des packs supplémentaires.
      </P>

      <Callout tone="success" title="Le calcul de marge pour une agence">
        Vous fournissez un service de lien en bio à 10 clients à $20/mois chacun. Cela fait $200 de revenus totaux. Pro
        Plus coûte $40 → un bénéfice net de $160. Un canal de revenus parfait pour une petite agence sans budget
        marketing.
      </Callout>

      <H2>Conclusion</H2>
      <P>
        Un sous-compte, ce n'est pas seulement « gérer plusieurs comptes » ; c'est <strong>un système évolutif pour votre
        équipe ou vos clients</strong>.
        Une solution pratique et rentable pour les agences, les chaînes de restaurants, les équipes de contenu et les
        agences immobilières.
      </P>
      <P>
        <A href="/pricing">Découvrez le forfait Pro Plus</A>, ouvrez votre premier sous-compte et développez
        l'expérience du lien en bio pour votre équipe.
      </P>
    </>
  );
}

function PostPt() {
  return (
    <>
      <P>
        Você gerencia uma agência ou tem uma equipe. Em vez de abrir uma conta BeyLink separada para cada um, você pode
        usar o recurso de <strong>subcontas</strong>{' '}
        Neste guia cobrimos a gestão de subcontas e casos de uso reais.
      </P>

      <H2>Como funcionam as subcontas</H2>
      <P>
        Você abre várias subcontas debaixo da sua conta principal. Cada subconta:
      </P>
      <UL>
        <li>Faz login com o próprio nome de usuário e senha</li>
        <li>Tem a própria URL de perfil público</li>
        <li>Só vê o próprio perfil (não consegue ver as outras subcontas)</li>
        <li>É gerenciada por você, o dono, a partir de um único painel</li>
      </UL>

      <H2>Para quem é ideal?</H2>

      <H3>1. Agências digitais</H3>
      <P>
        Você tem 10 clientes e oferece a cada um um serviço de link na bio. Em vez de 10 contas separadas, gerencie todas
        com uma única conta Pro Plus. Cobrança em um só lugar, atualizações de design em massa.
      </P>

      <H3>2. Redes de restaurantes</H3>
      <P>
        A mesma marca tem 5 unidades. Dê a cada filial a própria página de link na bio, mantendo o design e a marca
        consistentes. Quando você muda o template a partir da sua conta principal, pode aplicá-lo a todas em massa (Pro
        Plus).
      </P>

      <H3>3. Equipes de criadores de conteúdo</H3>
      <P>
        Você tem uma equipe de conteúdo de 4 pessoas. Cada uma gerencia um perfil de rede social diferente. Deixe um
        membro da equipe atualizar o próprio perfil, enquanto você vê as análises.
      </P>

      <H3>4. Imobiliárias</H3>
      <P>
        Você é uma imobiliária com 20 corretores. Dê a cada corretor o próprio cartão de link na bio (anúncios, contato).
        O logotipo e as cores da imobiliária ficam consistentes, enquanto os dados de cada corretor são pessoais.
      </P>

      <InlineCta
        title="Pro Plus para a sua equipe"
        desc="15 membros de equipe (máx. 40), aplicação de template em massa, gestão de subcontas, tudo por $40/mês."
        href="/pricing"
        label="Conhecer o Pro Plus →"
      />

      <H2>Gestão de subcontas (recursos)</H2>

      <H3>Gestão de permissões</H3>
      <P>
        Para cada subconta:
      </P>
      <UL>
        <li>Permissão de edição do perfil ligada/desligada</li>
        <li>Botão ativo/inativo (pause a subconta temporariamente quando quiser)</li>
        <li>Redefinição de senha</li>
      </UL>

      <H3>Aplicação de template em massa (Pro Plus)</H3>
      <P>
        Salve um template de design em Meus Templates e depois, com "Aplicar às subcontas em massa", aplique-o às 15
        subcontas com um clique. Vale ouro para a consistência da equipe.
      </P>

      <H3>Ciclo de vida do premium</H3>
      <P>
        Se o seu premium expira, as subcontas são automaticamente "suspensas" (não apagadas). Quando você renova, pode
        reativá-las todas em massa com a sua aprovação. Os seus dados ficam seguros, apenas temporariamente inativos.
      </P>

      <H2>Modelo de cobrança</H2>
      <P>
        Não há pagamento separado pelas subcontas. Um único plano Pro Plus ($40/mês) na sua conta principal cobre todas as
        suas subcontas. Se precisar de mais subcontas, você pode chegar a 40 comprando pacotes adicionais.
      </P>

      <Callout tone="success" title="A conta de lucro para uma agência">
        Você oferece um serviço de link na bio a 10 clientes por $20/mês cada. Isso dá $200 de receita total. O Pro Plus
        custa $40 → lucro líquido de $160. Um canal de receita perfeito para uma agência pequena sem orçamento de marketing.
      </Callout>

      <H2>Conclusão</H2>
      <P>
        Uma subconta não é só "gerenciar várias contas"; é <strong>um sistema escalável para a sua equipe ou os seus
        clientes</strong>.
        Uma solução prática e lucrativa para agências, redes de restaurantes, equipes de conteúdo e imobiliárias.
      </P>
      <P>
        <A href="/pricing">Conheça o plano Pro Plus</A>, abra a sua primeira subconta e amplie a experiência de link
        na bio para a sua equipe.
      </P>
    </>
  );
}

function PostIt() {
  return (
    <>
      <P>
        Gestisci un'agenzia o hai un team. Invece di aprire un account BeyLink separato per ognuno, puoi usare la
        funzione <strong>account secondari</strong>. In questa guida vediamo la gestione degli account secondari e casi
        d'uso reali.
      </P>

      <H2>Come funzionano gli account secondari</H2>
      <P>
        Apri più account secondari sotto il tuo account principale. Ogni account secondario:
      </P>
      <UL>
        <li>Accede con il proprio nome utente e la propria password</li>
        <li>Ha il proprio URL di profilo pubblico</li>
        <li>Vede solo il proprio profilo (non può vedere gli altri account secondari)</li>
        <li>Viene gestito da te, il titolare, da un unico pannello</li>
      </UL>

      <H2>Per chi è ideale?</H2>

      <H3>1. Agenzie digitali</H3>
      <P>
        Hai 10 clienti e a ciascuno offri un servizio di biolink. Invece di 10 account separati, gestiscili tutti con un
        solo account Pro Plus. Fatturazione in un unico posto, aggiornamenti del design in blocco.
      </P>

      <H3>2. Catene di ristoranti</H3>
      <P>
        Lo stesso brand ha 5 sedi. Dai a ogni sede la propria pagina biolink mantenendo design e brand coerenti. Quando
        cambi il template dal tuo account principale, puoi applicarlo a tutte in blocco (Pro Plus).
      </P>

      <H3>3. Team di content creator</H3>
      <P>
        Hai un team di contenuti di 4 persone. Ognuna gestisce un profilo social separato. Lascia che un membro del team
        aggiorni il proprio profilo, mentre tu vedi le statistiche.
      </P>

      <H3>4. Agenzie immobiliari</H3>
      <P>
        Sei un ufficio con 20 consulenti. Dai a ogni consulente la propria card biolink (annunci, contatti). Il logo e i
        colori dell'ufficio restano coerenti, mentre i dati di ogni consulente sono personali.
      </P>

      <InlineCta
        title="Pro Plus per il tuo team"
        desc="15 membri del team (max 40), applicazione template in blocco, gestione degli account secondari, tutto a $40/mese."
        href="/pricing"
        label="Scopri Pro Plus →"
      />

      <H2>Gestione degli account secondari (funzioni)</H2>

      <H3>Gestione dei permessi</H3>
      <P>
        Per ogni account secondario:
      </P>
      <UL>
        <li>Permesso di modifica del profilo on/off</li>
        <li>Interruttore attivo/inattivo (mettilo in pausa temporaneamente quando vuoi)</li>
        <li>Reimpostazione della password</li>
      </UL>

      <H3>Applicazione template in blocco (Pro Plus)</H3>
      <P>
        Salva un template di design in "I miei template", poi usa "Applica agli account secondari in blocco" per
        applicarlo a tutti i 15 account secondari con un clic. Oro puro per la coerenza del team.
      </P>

      <H3>Ciclo di vita del premium</H3>
      <P>
        Se il tuo premium scade, gli account secondari vengono automaticamente "sospesi" (non eliminati). Quando rinnovi,
        puoi riattivarli tutti in blocco con la tua approvazione. I tuoi dati sono al sicuro, solo temporaneamente inattivi.
      </P>

      <H2>Modello di fatturazione</H2>
      <P>
        Non c'è un pagamento separato per gli account secondari. Un unico piano Pro Plus ($40/mese) sul tuo account
        principale copre tutti i tuoi account secondari. Se ti servono più account secondari, puoi arrivare a 40
        acquistando pacchetti aggiuntivi.
      </P>

      <Callout tone="success" title="Il conto dei profitti per un'agenzia">
        Offri un servizio di biolink a 10 clienti a $20/mese ciascuno. Fanno $200 di ricavi totali. Pro Plus costa $40 →
        profitto netto di $160. Un canale di ricavo perfetto per una piccola agenzia senza budget di marketing.
      </Callout>

      <H2>Conclusione</H2>
      <P>
        Un account secondario non è solo "gestire più account"; è <strong>un sistema scalabile per il tuo team o i tuoi
        clienti</strong>.
        Una soluzione pratica e redditizia per agenzie, catene di ristoranti, team di contenuti e agenzie immobiliari.
      </P>
      <P>
        <A href="/pricing">Scopri il piano Pro Plus</A>, apri il tuo primo account secondario e fai crescere
        l'esperienza biolink per il tuo team.
      </P>
    </>
  );
}

function PostJa() {
  return (
    <>
      <P>
        あなたは代理店を運営している、あるいはチームを抱えています。全員に別々のBeyLinkアカウントを作るのではなく、
        <strong>サブアカウント</strong>機能を使えます。このガイドでは、サブアカウントの管理と実際の活用シーンを解説します。
      </P>

      <H2>サブアカウントの仕組み</H2>
      <P>
        メインアカウントの下に、複数のサブアカウントを作成します。それぞれのサブアカウントは、
      </P>
      <UL>
        <li>自分専用のユーザーネームとパスワードでログインする</li>
        <li>自分専用の公開プロフィールURLを持つ</li>
        <li>自分のプロフィールしか見られない（ほかのサブアカウントは見えない）</li>
        <li>オーナーであるあなたが、1つの画面からすべてを管理する</li>
      </UL>

      <H2>どんな人に最適か？</H2>

      <H3>1. デジタル代理店</H3>
      <P>
        クライアントが10社あり、それぞれにプロフィールリンクのサービスを提供しています。10個の別々のアカウントの代わりに、
        1つのPro Plusアカウントですべてを管理しましょう。請求は一か所で、デザインの更新は一括で行えます。
      </P>

      <H3>2. 飲食チェーン</H3>
      <P>
        同じブランドに5店舗があります。各店舗に専用のプロフィールリンクのページを持たせながら、デザインとブランドは統一したまま保てます。
        メインアカウントからテンプレートを変更すると、すべての店舗に一括で適用できます（Pro Plus）。
      </P>

      <H3>3. コンテンツクリエイターのチーム</H3>
      <P>
        4人のコンテンツチームがいます。それぞれが別々のSNSプロフィールを運用しています。チームメンバーには自分のプロフィールを更新してもらい、
        アナリティクスはあなたが見る、という運用ができます。
      </P>

      <H3>4. 不動産オフィス</H3>
      <P>
        担当者が20人いるオフィスです。各担当者に専用のプロフィールリンクのカード（物件情報、連絡先）を持たせられます。
        オフィスのロゴと色は統一しつつ、担当者の情報は個別にできます。
      </P>

      <InlineCta
        title="チームのためのPro Plus"
        desc="チームメンバー15人（最大40）、テンプレートの一括適用、サブアカウント管理。すべて月額$40。"
        href="/pricing"
        label="Pro Plusを見る →"
      />

      <H2>サブアカウントの管理（機能）</H2>

      <H3>権限の管理</H3>
      <P>
        サブアカウントごとに、
      </P>
      <UL>
        <li>プロフィール編集権限のオン/オフ</li>
        <li>有効/無効の切り替え（好きなときに一時停止できる）</li>
        <li>パスワードのリセット</li>
      </UL>

      <H3>テンプレートの一括適用（Pro Plus）</H3>
      <P>
        デザインテンプレートを「マイテンプレート」に保存し、「サブアカウントに一括適用」で15個すべてのサブアカウントにワンクリックで適用します。
        チームの統一感には計り知れない価値があります。
      </P>

      <H3>プレミアムのライフサイクル</H3>
      <P>
        プレミアムが切れると、サブアカウントは自動で「一時停止」されます（削除ではありません）。更新すれば、あなたの承認のうえで一括で再有効化できます。
        データは安全で、あくまで一時的に無効になるだけです。
      </P>

      <H2>請求のしくみ</H2>
      <P>
        サブアカウントごとの支払いはありません。メインアカウントの1つのPro Plusプラン（月額$40）が、すべてのサブアカウントをカバーします。
        もっとサブアカウントが必要なら、追加パックを購入して40まで増やせます。
      </P>

      <Callout tone="success" title="代理店の利益計算">
        10社のクライアントに、1社あたり月額$20でプロフィールリンクのサービスを提供します。合計で$200の売上です。Pro Plusは$40なので、
        純利益は$160。マーケティング予算のない小さな代理店にとって、完璧な収益チャネルです。
      </Callout>

      <H2>まとめ</H2>
      <P>
        サブアカウントは、単なる「複数アカウントの管理」ではありません。<strong>チームやクライアントのための、スケールできる仕組み</strong>です。
        代理店、飲食チェーン、コンテンツチーム、不動産オフィスにとって、実用的で利益につながる解決策です。
      </P>
      <P>
        <A href="/pricing">Pro Plusプランを見て</A>、最初のサブアカウントを作り、チームのためにプロフィールリンクの体験を広げましょう。
      </P>
    </>
  );
}

export default function Post() {
  const { lang } = useLanguage();
  return lang === 'ja' ? <PostJa /> : lang === 'it' ? <PostIt /> : lang === 'pt' ? <PostPt /> : lang === 'fr' ? <PostFr /> : lang === 'de' ? <PostDe /> : lang === 'ru' ? <PostRu /> : lang === 'es' ? <PostEs /> : lang === 'en' ? <PostEn /> : <PostTr />;
}
