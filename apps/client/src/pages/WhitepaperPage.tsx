import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useDocumentMeta } from "../lib/useDocumentMeta";

/* ─────────────────────────────────────────────────────────────────────────────
   VeilChat Security & Privacy Whitepaper
   Route: /whitepaper

   - Full technical and ethical analysis of VeilChat's privacy architecture
   - Multi-language UI (12 languages) — same language set as WhatsApp blog
   - PDF download via window.print() with @media print stylesheet
   - Share via Web Share API / clipboard fallback
   - Reading progress bar, TOC, citations
   ───────────────────────────────────────────────────────────────────────── */

type Lang =
  | "en" | "hi" | "pt" | "id" | "es"
  | "ru" | "de" | "it" | "ar" | "tr" | "fr" | "ur";

const ALL_LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "pt", label: "Português" },
  { code: "id", label: "Bahasa Indonesia" },
  { code: "es", label: "Español" },
  { code: "ru", label: "Русский" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "ar", label: "العربية" },
  { code: "tr", label: "Türkçe" },
  { code: "fr", label: "Français" },
  { code: "ur", label: "اردو" },
];

const VALID_LANGS = new Set<string>(ALL_LANGS.map((l) => l.code));

const RTL_LANGS: Set<Lang> = new Set(["ar", "ur"]);

function detectLang(): Lang {
  if (typeof window === "undefined") return "en";
  try {
    const saved = localStorage.getItem("veil:wp_lang");
    if (saved && VALID_LANGS.has(saved)) return saved as Lang;
    const nav = (navigator.language || "").toLowerCase();
    if (nav.startsWith("hi")) return "hi";
    if (nav.startsWith("pt")) return "pt";
    if (nav.startsWith("id") || nav.startsWith("ms")) return "id";
    if (nav.startsWith("es")) return "es";
    if (nav.startsWith("ru")) return "ru";
    if (nav.startsWith("de")) return "de";
    if (nav.startsWith("it")) return "it";
    if (nav.startsWith("ar")) return "ar";
    if (nav.startsWith("tr")) return "tr";
    if (nav.startsWith("fr")) return "fr";
    if (nav.startsWith("ur")) return "ur";
  } catch { /* ignore */ }
  return "en";
}

function useReadingProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      const v = total > 0 ? (h.scrollTop / total) * 100 : 0;
      setPct(Math.min(100, Math.max(0, v)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return pct;
}

/* ── i18n ── */

const T: Record<Lang, {
  badge: string;
  title: string;
  lead: string;
  download: string;
  share: string;
  shared: string;
  copied: string;
  readingTime: string;
  sources: string;
  updated: string;
  tocLabel: string;
  sourcesHeading: string;
  methodology: string;
  corrections: string;
  tryVeilChat: string;
  backHome: string;
  footerCopy: string;
  nonEnglishNote: string;
}> = {
  en: {
    badge: "Technical Whitepaper · Fully Sourced",
    title: "VeilChat Security & Privacy Whitepaper",
    lead: "A complete technical and ethical analysis of how VeilChat protects your privacy — from the cryptographic primitives on your device to the policies that govern what is never stored on any server. Every claim in this document is verifiable in the open-source codebase.",
    download: "Download PDF",
    share: "Share",
    shared: "Shared!",
    copied: "Link copied!",
    readingTime: "Reading time",
    sources: "primary sources",
    updated: "Updated",
    tocLabel: "What's in this document",
    sourcesHeading: "References & sources",
    methodology: "Methodology and corrections",
    corrections: "This document was assembled from public sources, open-source code, and first-party technical documentation. Every architectural claim can be verified in the VeilChat GitHub repository. If you spot a factual error or an outdated claim, please contact us — we will publish a correction with a dated changelog.",
    tryVeilChat: "Try VeilChat — free, 30 seconds",
    backHome: "← Back to home",
    footerCopy: "Private by design.",
    nonEnglishNote: "",
  },
  hi: {
    badge: "तकनीकी व्हाइटपेपर · पूर्ण स्रोत",
    title: "VeilChat सुरक्षा और गोपनीयता व्हाइटपेपर",
    lead: "VeilChat आपकी प्राइवेसी कैसे सुरक्षित रखता है — आपके डिवाइस पर क्रिप्टोग्राफिक नींव से लेकर उन नीतियों तक जो तय करती हैं कि किसी भी सर्वर पर कभी क्या संग्रहीत नहीं होता। इस दस्तावेज़ का हर दावा ओपन-सोर्स कोडबेस में सत्यापन योग्य है।",
    download: "PDF डाउनलोड करें",
    share: "शेयर करें",
    shared: "शेयर हो गया!",
    copied: "लिंक कॉपी हो गया!",
    readingTime: "पढ़ने का समय",
    sources: "मुख्य स्रोत",
    updated: "अद्यतन",
    tocLabel: "इस दस्तावेज़ में क्या-क्या है",
    sourcesHeading: "संदर्भ और स्रोत",
    methodology: "Methodology और corrections",
    corrections: "यह दस्तावेज़ सार्वजनिक स्रोतों, ओपन-सोर्स कोड और प्रथम-पक्ष तकनीकी दस्तावेज़ीकरण से तैयार किया गया है। हर आर्किटेक्चरल दावा VeilChat GitHub रिपॉजिटरी में सत्यापित किया जा सकता है।",
    tryVeilChat: "VeilChat आज़माएँ — मुफ़्त, 30 सेकंड में",
    backHome: "← होम पर वापस",
    footerCopy: "Privacy by design।",
    nonEnglishNote: "मुख्य लेख अंग्रेज़ी में है — यह एक तकनीकी दस्तावेज़ है और सभी तकनीकी विवरण अंग्रेज़ी में सबसे सटीक रूप से व्यक्त होते हैं।",
  },
  es: {
    badge: "Informe Técnico · Completamente documentado",
    title: "Informe Técnico de Seguridad y Privacidad de VeilChat",
    lead: "Un análisis técnico y ético completo de cómo VeilChat protege tu privacidad — desde los fundamentos criptográficos en tu dispositivo hasta las políticas que gobiernan lo que nunca se almacena en ningún servidor.",
    download: "Descargar PDF",
    share: "Compartir",
    shared: "¡Compartido!",
    copied: "¡Enlace copiado!",
    readingTime: "Tiempo de lectura",
    sources: "fuentes primarias",
    updated: "Actualizado",
    tocLabel: "Contenido de este documento",
    sourcesHeading: "Referencias y fuentes",
    methodology: "Metodología y correcciones",
    corrections: "Este documento fue elaborado a partir de fuentes públicas, código abierto y documentación técnica de primera parte. Cada afirmación arquitectónica puede verificarse en el repositorio de GitHub de VeilChat.",
    tryVeilChat: "Probar VeilChat — gratis, 30 segundos",
    backHome: "← Volver al inicio",
    footerCopy: "Privacidad por diseño.",
    nonEnglishNote: "El artículo principal está en inglés — este es un documento técnico y todos los detalles técnicos se expresan con mayor precisión en inglés.",
  },
  pt: {
    badge: "Relatório Técnico · Totalmente documentado",
    title: "Whitepaper de Segurança e Privacidade do VeilChat",
    lead: "Uma análise técnica e ética completa de como o VeilChat protege sua privacidade — desde os primitivos criptográficos no seu dispositivo até as políticas que governam o que nunca é armazenado em nenhum servidor.",
    download: "Baixar PDF",
    share: "Compartilhar",
    shared: "Compartilhado!",
    copied: "Link copiado!",
    readingTime: "Tempo de leitura",
    sources: "fontes primárias",
    updated: "Atualizado",
    tocLabel: "Conteúdo deste documento",
    sourcesHeading: "Referências e fontes",
    methodology: "Metodologia e correções",
    corrections: "Este documento foi elaborado a partir de fontes públicas, código aberto e documentação técnica de primeira parte. Toda afirmação arquitetural pode ser verificada no repositório GitHub do VeilChat.",
    tryVeilChat: "Experimente o VeilChat — grátis, 30 segundos",
    backHome: "← Voltar ao início",
    footerCopy: "Privacidade por design.",
    nonEnglishNote: "O artigo principal está em inglês — este é um documento técnico e todos os detalhes técnicos são expressos com mais precisão em inglês.",
  },
  id: {
    badge: "Laporan Teknis · Sepenuhnya bersumber",
    title: "Whitepaper Keamanan & Privasi VeilChat",
    lead: "Analisis teknis dan etis lengkap tentang bagaimana VeilChat melindungi privasi Anda — dari primitif kriptografi di perangkat Anda hingga kebijakan yang mengatur apa yang tidak pernah disimpan di server mana pun.",
    download: "Unduh PDF",
    share: "Bagikan",
    shared: "Dibagikan!",
    copied: "Tautan disalin!",
    readingTime: "Waktu baca",
    sources: "sumber utama",
    updated: "Diperbarui",
    tocLabel: "Isi dokumen ini",
    sourcesHeading: "Referensi & sumber",
    methodology: "Metodologi dan koreksi",
    corrections: "Dokumen ini disusun dari sumber publik, kode sumber terbuka, dan dokumentasi teknis pihak pertama. Setiap klaim arsitektur dapat diverifikasi di repositori GitHub VeilChat.",
    tryVeilChat: "Coba VeilChat — gratis, 30 detik",
    backHome: "← Kembali ke beranda",
    footerCopy: "Privasi berdasarkan desain.",
    nonEnglishNote: "Artikel utama dalam bahasa Inggris — ini adalah dokumen teknis dan semua detail teknis paling akurat diungkapkan dalam bahasa Inggris.",
  },
  ru: {
    badge: "Технический документ · Полностью с источниками",
    title: "Технический документ по безопасности и конфиденциальности VeilChat",
    lead: "Полный технический и этический анализ того, как VeilChat защищает вашу конфиденциальность — от криптографических примитивов на вашем устройстве до политик, которые определяют, что никогда не хранится ни на каком сервере.",
    download: "Скачать PDF",
    share: "Поделиться",
    shared: "Поделились!",
    copied: "Ссылка скопирована!",
    readingTime: "Время чтения",
    sources: "первичных источника",
    updated: "Обновлено",
    tocLabel: "Содержание документа",
    sourcesHeading: "Ссылки и источники",
    methodology: "Методология и исправления",
    corrections: "Этот документ составлен из публичных источников, открытого исходного кода и первичной технической документации. Каждое архитектурное утверждение может быть проверено в репозитории GitHub VeilChat.",
    tryVeilChat: "Попробовать VeilChat — бесплатно, 30 секунд",
    backHome: "← На главную",
    footerCopy: "Конфиденциальность по дизайну.",
    nonEnglishNote: "Основная статья на английском языке — это технический документ, и все технические детали наиболее точно изложены на английском.",
  },
  de: {
    badge: "Technisches Whitepaper · Vollständig belegt",
    title: "VeilChat Sicherheits- und Datenschutz-Whitepaper",
    lead: "Eine vollständige technische und ethische Analyse, wie VeilChat Ihre Privatsphäre schützt — von den kryptographischen Grundlagen auf Ihrem Gerät bis hin zu den Richtlinien, die bestimmen, was niemals auf einem Server gespeichert wird.",
    download: "PDF herunterladen",
    share: "Teilen",
    shared: "Geteilt!",
    copied: "Link kopiert!",
    readingTime: "Lesezeit",
    sources: "Primärquellen",
    updated: "Aktualisiert",
    tocLabel: "Inhalt dieses Dokuments",
    sourcesHeading: "Referenzen und Quellen",
    methodology: "Methodik und Korrekturen",
    corrections: "Dieses Dokument wurde aus öffentlichen Quellen, Open-Source-Code und erstparteilicher technischer Dokumentation zusammengestellt. Jede architektonische Aussage kann im GitHub-Repository von VeilChat überprüft werden.",
    tryVeilChat: "VeilChat ausprobieren — kostenlos, 30 Sekunden",
    backHome: "← Zurück zur Startseite",
    footerCopy: "Datenschutz by Design.",
    nonEnglishNote: "Der Hauptartikel ist auf Englisch — dies ist ein technisches Dokument und alle technischen Details werden auf Englisch am präzisesten ausgedrückt.",
  },
  it: {
    badge: "Whitepaper Tecnico · Completamente documentato",
    title: "Whitepaper sulla Sicurezza e Privacy di VeilChat",
    lead: "Un'analisi tecnica ed etica completa di come VeilChat protegge la tua privacy — dalle primitive crittografiche sul tuo dispositivo alle politiche che regolano ciò che non viene mai archiviato su alcun server.",
    download: "Scarica PDF",
    share: "Condividi",
    shared: "Condiviso!",
    copied: "Link copiato!",
    readingTime: "Tempo di lettura",
    sources: "fonti primarie",
    updated: "Aggiornato",
    tocLabel: "Contenuto di questo documento",
    sourcesHeading: "Riferimenti e fonti",
    methodology: "Metodologia e correzioni",
    corrections: "Questo documento è stato elaborato da fonti pubbliche, codice open source e documentazione tecnica di prima parte. Ogni affermazione architetturale può essere verificata nel repository GitHub di VeilChat.",
    tryVeilChat: "Prova VeilChat — gratuito, 30 secondi",
    backHome: "← Torna alla home",
    footerCopy: "Privacy per design.",
    nonEnglishNote: "L'articolo principale è in inglese — questo è un documento tecnico e tutti i dettagli tecnici sono espressi con maggiore precisione in inglese.",
  },
  ar: {
    badge: "ورقة بيضاء تقنية · موثقة بالكامل",
    title: "الورقة البيضاء للأمن والخصوصية في VeilChat",
    lead: "تحليل تقني وأخلاقي شامل لكيفية حماية VeilChat لخصوصيتك — من البدائل التشفيرية على جهازك إلى السياسات التي تحكم ما لا يُخزَّن أبدًا على أي خادم.",
    download: "تحميل PDF",
    share: "مشاركة",
    shared: "تمت المشاركة!",
    copied: "تم نسخ الرابط!",
    readingTime: "وقت القراءة",
    sources: "مصادر أساسية",
    updated: "محدّث",
    tocLabel: "محتويات هذا المستند",
    sourcesHeading: "المراجع والمصادر",
    methodology: "المنهجية والتصحيحات",
    corrections: "تم إعداد هذا المستند من مصادر عامة وكود مفتوح المصدر ووثائق تقنية من الدرجة الأولى. يمكن التحقق من كل ادعاء معماري في مستودع VeilChat على GitHub.",
    tryVeilChat: "جرّب VeilChat — مجاناً، 30 ثانية",
    backHome: "← العودة إلى الرئيسية",
    footerCopy: "الخصوصية بالتصميم.",
    nonEnglishNote: "المقال الرئيسي باللغة الإنجليزية — هذه وثيقة تقنية وجميع التفاصيل التقنية تُعبَّر عنها بدقة أكبر باللغة الإنجليزية.",
  },
  tr: {
    badge: "Teknik Teknik Rapor · Tam Kaynakçalı",
    title: "VeilChat Güvenlik ve Gizlilik Teknik Raporu",
    lead: "VeilChat'in gizliliğinizi nasıl koruduğuna dair eksiksiz teknik ve etik bir analiz — cihazınızdaki kriptografik temellerden hiçbir sunucuda asla saklanmayanları belirleyen politikalara kadar.",
    download: "PDF İndir",
    share: "Paylaş",
    shared: "Paylaşıldı!",
    copied: "Bağlantı kopyalandı!",
    readingTime: "Okuma süresi",
    sources: "birincil kaynak",
    updated: "Güncellendi",
    tocLabel: "Bu belgede neler var",
    sourcesHeading: "Kaynaklar ve referanslar",
    methodology: "Metodoloji ve düzeltmeler",
    corrections: "Bu belge, kamuya açık kaynaklardan, açık kaynak koddan ve birinci taraf teknik belgelerden derlenmiştir. Her mimari iddia, VeilChat GitHub deposunda doğrulanabilir.",
    tryVeilChat: "VeilChat'i deneyin — ücretsiz, 30 saniye",
    backHome: "← Ana sayfaya dön",
    footerCopy: "Tasarım gereği gizlilik.",
    nonEnglishNote: "Ana makale İngilizce'dir — bu teknik bir belge olup tüm teknik ayrıntılar İngilizce'de en doğru şekilde ifade edilmektedir.",
  },
  fr: {
    badge: "Livre Blanc Technique · Entièrement documenté",
    title: "Livre Blanc Sécurité & Confidentialité de VeilChat",
    lead: "Une analyse technique et éthique complète de la manière dont VeilChat protège votre vie privée — des primitives cryptographiques sur votre appareil aux politiques qui régissent ce qui n'est jamais stocké sur aucun serveur.",
    download: "Télécharger le PDF",
    share: "Partager",
    shared: "Partagé !",
    copied: "Lien copié !",
    readingTime: "Temps de lecture",
    sources: "sources primaires",
    updated: "Mis à jour",
    tocLabel: "Contenu de ce document",
    sourcesHeading: "Références et sources",
    methodology: "Méthodologie et corrections",
    corrections: "Ce document a été élaboré à partir de sources publiques, de code open source et de documentation technique de première partie. Chaque affirmation architecturale peut être vérifiée dans le dépôt GitHub de VeilChat.",
    tryVeilChat: "Essayez VeilChat — gratuit, 30 secondes",
    backHome: "← Retour à l'accueil",
    footerCopy: "Confidentialité par conception.",
    nonEnglishNote: "L'article principal est en anglais — il s'agit d'un document technique et tous les détails techniques sont exprimés avec plus de précision en anglais.",
  },
  ur: {
    badge: "تکنیکی رپورٹ · مکمل حوالہ جات کے ساتھ",
    title: "VeilChat سیکیورٹی اور پرائیویسی وائٹ پیپر",
    lead: "VeilChat آپ کی پرائیویسی کیسے محفوظ رکھتا ہے اس کا مکمل تکنیکی اور اخلاقی تجزیہ — آپ کے ڈیوائس پر کرپٹوگرافک بنیادوں سے لے کر ان پالیسیوں تک جو یہ طے کرتی ہیں کہ کسی بھی سرور پر کبھی کیا محفوظ نہیں ہوتا۔",
    download: "PDF ڈاؤن لوڈ کریں",
    share: "شیئر کریں",
    shared: "شیئر ہو گیا!",
    copied: "لنک کاپی ہو گیا!",
    readingTime: "پڑھنے کا وقت",
    sources: "بنیادی ذرائع",
    updated: "تازہ کاری",
    tocLabel: "اس دستاویز میں کیا ہے",
    sourcesHeading: "حوالہ جات اور ذرائع",
    methodology: "طریقہ کار اور اصلاحات",
    corrections: "یہ دستاویز عوامی ذرائع، اوپن سورس کوڈ اور فرسٹ پارٹی تکنیکی دستاویزات سے تیار کی گئی ہے۔",
    tryVeilChat: "VeilChat آزمائیں — مفت، 30 سیکنڈ میں",
    backHome: "← ہوم پر واپس",
    footerCopy: "ڈیزائن کے ذریعے پرائیویسی۔",
    nonEnglishNote: "بنیادی مضمون انگریزی میں ہے — یہ ایک تکنیکی دستاویز ہے اور تمام تکنیکی تفصیلات انگریزی میں زیادہ درست طریقے سے بیان ہوتی ہیں۔",
  },
};

const TOC_ITEMS = [
  { id: "exec", label: "§1  Executive Summary" },
  { id: "problem", label: "§2  The Problem With Modern Messaging" },
  { id: "vs-whatsapp", label: "§3  VeilChat vs WhatsApp" },
  { id: "vs-signal", label: "§4  VeilChat vs Signal" },
  { id: "signal-protocol", label: "§5  Signal Protocol — Cryptographic Foundations" },
  { id: "double-ratchet", label: "§6  The Double Ratchet Algorithm" },
  { id: "x3dh", label: "§7  X3DH Key Agreement" },
  { id: "group-encryption", label: "§8  Group Encryption — Sender Keys" },
  { id: "identity", label: "§9  Identity Management & Account Privacy" },
  { id: "vault", label: "§10 The Vault — Biometric Private Space" },
  { id: "what-we-store", label: "§11 What VeilChat Stores — Full Transparency" },
  { id: "what-we-dont", label: "§12 What VeilChat Does NOT Store" },
  { id: "open-source", label: "§13 Open Source — Auditability & Trust" },
  { id: "features", label: "§14 Complete Feature Reference" },
  { id: "high-profile", label: "§15 Security for High-Profile Individuals" },
  { id: "tech-stack", label: "§16 Technology Stack" },
  { id: "threat-model", label: "§17 Threat Model" },
  { id: "limitations", label: "§18 Honest Limitations" },
  { id: "compliance", label: "§19 Compliance & Jurisdiction" },
  { id: "conclusion", label: "§20 Conclusion" },
];

type Ref = { n: number; title: string; publisher: string; url: string; date?: string };

const REFS: Ref[] = [
  { n: 1, title: "Signal Protocol Specifications", publisher: "Signal Foundation", url: "https://signal.org/docs/", date: "current" },
  { n: 2, title: "The Double Ratchet Algorithm", publisher: "Marlinspike & Perrin / Signal", url: "https://signal.org/docs/specifications/doubleratchet/", date: "2016" },
  { n: 3, title: "The X3DH Key Agreement Protocol", publisher: "Marlinspike & Perrin / Signal", url: "https://signal.org/docs/specifications/x3dh/", date: "2016" },
  { n: 4, title: "Sealed Sender — Signal Blog", publisher: "Signal Blog", url: "https://signal.org/blog/sealed-sender/", date: "2018" },
  { n: 5, title: "WebAuthn Level 2 — W3C Specification", publisher: "W3C", url: "https://www.w3.org/TR/webauthn-2/", date: "2021" },
  { n: 6, title: "BIP-39 Mnemonic Code for Generating Deterministic Keys", publisher: "Bitcoin Improvement Proposals", url: "https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki", date: "2013" },
  { n: 7, title: "AES-GCM NIST Recommendation", publisher: "NIST", url: "https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf", date: "2007" },
  { n: 8, title: "HKDF — HMAC-based Key Derivation Function", publisher: "IETF RFC 5869", url: "https://datatracker.ietf.org/doc/html/rfc5869", date: "2010" },
  { n: 9, title: "Ed25519 — High-speed high-security signatures", publisher: "Bernstein et al.", url: "https://ed25519.cr.yp.to/", date: "2011" },
  { n: 10, title: "X25519 — Elliptic-curve Diffie-Hellman", publisher: "IETF RFC 7748", url: "https://datatracker.ietf.org/doc/html/rfc7748", date: "2016" },
  { n: 11, title: "Sender Keys for Group Messaging", publisher: "Signal Foundation", url: "https://signal.org/docs/specifications/senderkey/", date: "current" },
  { n: 12, title: "WhatsApp Government Requests — Transparency Center", publisher: "Meta", url: "https://transparency.meta.com/reports/government-data-requests/", date: "current" },
  { n: 13, title: "WhatsApp Privacy Policy — Data Shared with Meta", publisher: "WhatsApp", url: "https://www.whatsapp.com/legal/privacy-policy", date: "current" },
  { n: 14, title: "FBI Document: WhatsApp data available in real time", publisher: "Rolling Stone", url: "https://www.rollingstone.com/politics/politics-features/whatsapp-imessage-facebook-apple-fbi-privacy-1261816/", date: "Dec 2021" },
  { n: 15, title: "Irish DPC Fines WhatsApp €225 Million", publisher: "Irish Data Protection Commission", url: "https://www.dataprotection.ie/en/news-media/press-releases/data-protection-commission-announces-decision-whatsapp-inquiry", date: "Sep 2021" },
  { n: 16, title: "NSO Pegasus — WhatsApp zero-day (CVE-2019-3568)", publisher: "NIST NVD", url: "https://nvd.nist.gov/vuln/detail/CVE-2019-3568", date: "May 2019" },
  { n: 17, title: "WhatsApp Ads in Status Updates 2025", publisher: "Social Media Today", url: "https://www.socialmediatoday.com/news/whatsapp-ads-in-status-promoted-channels-subscriptions/750852/", date: "Jun 2025" },
  { n: 18, title: "Building Private Processing for AI Tools on WhatsApp", publisher: "Engineering at Meta", url: "https://engineering.fb.com/2025/04/29/security/whatsapp-private-processing-ai-tools/", date: "Apr 2025" },
  { n: 19, title: "Drizzle ORM Documentation", publisher: "Drizzle Team", url: "https://orm.drizzle.team/", date: "current" },
  { n: 20, title: "Fastify — Fast and low overhead web framework for Node.js", publisher: "Fastify", url: "https://www.fastify.io/", date: "current" },
  { n: 21, title: "tRPC — End-to-end typesafe APIs", publisher: "tRPC", url: "https://trpc.io/", date: "current" },
  { n: 22, title: "Neon — Serverless Postgres", publisher: "Neon", url: "https://neon.tech/", date: "current" },
  { n: 23, title: "Cloudflare R2 — Object Storage", publisher: "Cloudflare", url: "https://www.cloudflare.com/developer-platform/r2/", date: "current" },
  { n: 24, title: "Vite Plugin PWA", publisher: "vite-pwa.netlify.app", url: "https://vite-pwa-org.netlify.app/", date: "current" },
  { n: 25, title: "noble-curves — Auditable JS Elliptic Curve Cryptography", publisher: "Paul Miller", url: "https://paulmillr.com/noble/", date: "current" },
  { n: 26, title: "Signal Protocol — Security Audit by Cure53", publisher: "Cure53", url: "https://cure53.de/pentest-report_signal-protocol.pdf", date: "2016" },
  { n: 27, title: "Progressive Web Apps — What, Why, and How", publisher: "web.dev / Google", url: "https://web.dev/progressive-web-apps/", date: "current" },
  { n: 28, title: "Forward Secrecy in Messaging", publisher: "EFF", url: "https://ssd.eff.org/module/choosing-your-tools", date: "current" },
  { n: 29, title: "Dexie.js — A Minimalistic Wrapper for IndexedDB", publisher: "Dexie.org", url: "https://dexie.org/", date: "current" },
  { n: 30, title: "GDPR — Regulation (EU) 2016/679", publisher: "European Parliament", url: "https://gdpr-info.eu/", date: "2018" },
  { n: 31, title: "HMAC-SHA256 — RFC 2104", publisher: "IETF", url: "https://datatracker.ietf.org/doc/html/rfc2104", date: "1997" },
  { n: 32, title: "Signal — Independent security audit 2016", publisher: "iSEC Partners", url: "https://github.com/signalapp/Signal-Android/blob/main/isec-audit-2016.pdf", date: "2016" },
  { n: 33, title: "Capacitor — Cross-platform native runtime for web apps", publisher: "Ionic", url: "https://capacitorjs.com/", date: "current" },
];

/* ── styled helpers ── */

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="mt-14 mb-4 text-[26px] sm:text-[30px] font-semibold tracking-tight scroll-mt-24"
      style={{ color: "#0F2A18", fontFamily: "'Fraunces','Inter',serif" }}
    >
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="mt-8 mb-3 text-[19px] sm:text-[21px] font-semibold tracking-tight"
      style={{ color: "#0F2A18" }}
    >
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 text-[17.5px] leading-[1.82] text-[#1f2a23]">{children}</p>;
}

function Callout({ title, children, tone = "green" }: { title?: string; children: React.ReactNode; tone?: "green" | "amber" | "red" | "blue" }) {
  const styles = {
    green: { bg: "#E8F3E5", border: "#2E6F40" },
    amber: { bg: "#FFF8E6", border: "#C0860A" },
    red: { bg: "#FFF0ED", border: "#C0391A" },
    blue: { bg: "#EAF2FF", border: "#2E5FAF" },
  }[tone];
  return (
    <div
      className="mt-6 rounded-2xl px-5 py-4"
      style={{ backgroundColor: styles.bg, border: `1px solid ${styles.border}40` }}
    >
      {title && (
        <div
          className="text-[11px] font-bold tracking-[0.15em] uppercase mb-2"
          style={{ color: styles.border }}
        >
          {title}
        </div>
      )}
      <div className="text-[16px] text-[#1f2a23] leading-[1.72]">{children}</div>
    </div>
  );
}

function Check() {
  return <span className="font-semibold" style={{ color: "#2E6F40" }}>✓</span>;
}
function Cross() {
  return <span className="font-semibold" style={{ color: "#C0391A" }}>✗</span>;
}
function Partial() {
  return <span className="font-semibold" style={{ color: "#C0860A" }}>~</span>;
}

function CompareTable({ columns, rows }: { columns: string[]; rows: { label: string; cells: React.ReactNode[] }[] }) {
  return (
    <div className="mt-6 -mx-5 sm:mx-0 overflow-x-auto no-print-scroll">
      <table
        className="w-full min-w-[500px] text-[14.5px] text-left border-separate border-spacing-0 rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(15,42,24,0.1)", backgroundColor: "white" }}
      >
        <thead>
          <tr style={{ backgroundColor: "#E8F3E5" }}>
            <th className="px-4 py-3 font-semibold" style={{ borderBottom: "1px solid rgba(15,42,24,0.1)", color: "#0F2A18" }}></th>
            {columns.map((c) => (
              <th key={c} className="px-4 py-3 font-semibold text-center" style={{ borderBottom: "1px solid rgba(15,42,24,0.1)", color: "#0F2A18" }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.label} style={{ backgroundColor: i % 2 ? "rgba(251,246,238,0.55)" : "white" }}>
              <th className="px-4 py-3 font-medium text-left align-top" style={{ borderBottom: "1px solid rgba(15,42,24,0.06)", color: "#0F2A18" }}>{r.label}</th>
              {r.cells.map((cell, idx) => (
                <td key={idx} className="px-4 py-3 text-center align-top" style={{ borderBottom: "1px solid rgba(15,42,24,0.06)", color: "#28332c" }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Cite({ n }: { n: number }) {
  return (
    <a
      href={`#ref-${n}`}
      className="inline-flex items-baseline align-baseline ml-0.5 text-[11px] font-bold hover:underline"
      style={{ color: "#2E6F40" }}
      aria-label={`Reference ${n}`}
    >
      [{n}]
    </a>
  );
}

function FeatureTag({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12.5px] font-medium mr-2 mb-2"
      style={{ backgroundColor: "#E8F3E5", color: "#1F4F2D" }}
    >
      <span style={{ color: "#2E6F40" }}>✓</span> {label}
    </span>
  );
}

/* ── main article (English) ── */

function Article() {
  return (
    <>
      {/* §1 */}
      <H2 id="exec">§1 Executive Summary</H2>
      <Callout title="Key facts at a glance" tone="green">
        <ul className="list-none space-y-1.5">
          <li><Check /> <strong>Zero-knowledge server</strong> — the server stores only encrypted ciphertext it cannot read.</li>
          <li><Check /> <strong>Signal Protocol</strong> — X3DH key agreement + Double Ratchet, identical to Signal and WhatsApp's core crypto.</li>
          <li><Check /> <strong>No phone number required</strong> — create a fully anonymous Random ID account with zero personal information.</li>
          <li><Check /> <strong>Open source</strong> — every line of code is publicly auditable on GitHub.</li>
          <li><Check /> <strong>100% free</strong> — no subscription, no ads, no data sold, ever.</li>
          <li><Check /> <strong>PWA-first</strong> — install on any device in 30 seconds, no app store required.</li>
        </ul>
      </Callout>

      <P>
        VeilChat is a privacy-first Progressive Web App messenger built on the Signal Protocol — the same cryptographic
        foundation trusted by Signal, WhatsApp, and used by security researchers, journalists, activists, and
        governments worldwide. Unlike WhatsApp, VeilChat is not owned by an advertising corporation and collects
        no behavioral data. Unlike Signal, VeilChat does not require a phone number, offers a biometric-locked
        Vault for hidden conversations, and runs entirely in the browser as an installable PWA — no app store approval,
        no update delays, always the latest version.
      </P>
      <P>
        This document provides a complete technical, architectural, and ethical analysis of VeilChat's privacy
        guarantees. Every claim is anchored to the open-source codebase, published cryptographic specifications,
        or primary regulatory and academic sources. Nothing here requires trust — everything can be verified.
      </P>

      {/* §2 */}
      <H2 id="problem">§2 The Problem With Modern Messaging</H2>
      <P>
        More than five billion people use smartphone messaging apps daily. Yet despite widespread adoption of
        encryption, the vast majority of those users are not protected in the ways they believe they are.
        End-to-end encryption of message <em>content</em> is now common — but content is only one dimension of
        privacy. The other dimensions — metadata, platform ownership, backup policies, government access, and
        business-messaging exceptions — remain deeply problematic across every major platform.
      </P>

      <H3>WhatsApp — The Metadata Problem</H3>
      <P>
        WhatsApp encrypts message content end-to-end using the Signal Protocol. <Cite n={13} /> But it is owned
        by Meta, the world's largest advertising company. <Cite n={12} /> WhatsApp collects and shares with Meta:
        your phone number, your contact graph (everyone you message and how often), your device identifiers, your
        IP address, your location region, your usage patterns, and your online status signals. <Cite n={13} />
        This metadata is enough to reconstruct a detailed social graph of your life — who you talk to, when, and
        for how long — without reading a single message.
      </P>
      <P>
        In 2021, WhatsApp was fined €225 million by the Irish Data Protection Commission for GDPR violations
        related to transparency about data sharing with Meta. <Cite n={15} /> In 2025, Meta introduced advertising
        into WhatsApp's Status and Channels features, <Cite n={17} /> and integrated Meta AI with access to
        conversation content via "Private Processing." <Cite n={18} /> FBI documentation obtained in 2021 confirmed
        that WhatsApp provides subscriber information, IP address records, and message metadata to law enforcement
        in real time under lawful process. <Cite n={14} />
      </P>
      <P>
        Business messages sent via the WhatsApp Business API are processed by Meta's servers and are
        explicitly <em>not</em> end-to-end encrypted in the same way as personal messages. <Cite n={13} /> Hundreds
        of millions of users regularly message their banks, airlines, delivery services, and government agencies
        over WhatsApp — without understanding that those conversations are handled differently.
      </P>

      <H3>Telegram — Not Encrypted By Default</H3>
      <P>
        Telegram is frequently mischaracterized as an encrypted messenger. By default, Telegram messages are
        stored on Telegram's servers in a format Telegram can read. End-to-end encryption only applies to
        manually initiated "Secret Chats." Group chats, channels, and bot conversations are never end-to-end
        encrypted. Telegram's server-side encryption means that any server breach, government compulsion,
        or insider threat could expose user messages.
      </P>

      <H3>The Inference Attack Problem</H3>
      <P>
        Even with perfect message encryption, communication metadata enables powerful inference attacks. Research
        by MIT, Stanford, and the EFF has shown that knowing <em>who</em> communicates with <em>whom</em>, how
        frequently, and at what times is often sufficient to infer political affiliation, religious practice,
        health status, relationship status, and professional associations — without reading a single message. <Cite n={28} />
        VeilChat is designed to minimize the metadata available to the server from the very first connection.
      </P>

      {/* §3 */}
      <H2 id="vs-whatsapp">§3 VeilChat vs WhatsApp — A Head-to-Head Analysis</H2>
      <P>The following table compares VeilChat and WhatsApp across the dimensions that matter most to privacy-conscious users.</P>

      <CompareTable
        columns={["VeilChat", "WhatsApp"]}
        rows={[
          { label: "Message encryption", cells: [<><Check /> E2EE always</>, <><Check /> E2EE (personal chats)</>] },
          { label: "Server reads message content", cells: [<><Check /> Never — opaque ciphertext only</>, <><Cross /> Business API messages readable</>] },
          { label: "Metadata collected", cells: [<><Check /> Minimal (delivery timestamps only)</>, <><Cross /> Extensive (contact graph, usage patterns, IP, device)</>] },
          { label: "Owned by advertising company", cells: [<><Check /> No</>, <><Cross /> Yes (Meta)</>] },
          { label: "Government content requests", cells: [<><Check /> Cannot comply — nothing readable</>, <><Cross /> Provides metadata in real time</>] },
          { label: "Phone number required", cells: [<><Check /> No — Random ID available</>, <><Cross /> Yes, always</>] },
          { label: "Open source", cells: [<><Check /> 100% — client + server on GitHub</>, <><Partial /> Client partially open</>] },
          { label: "Ads", cells: [<><Check /> Never</>, <><Cross /> Status + Channels ads (2025)</>] },
          { label: "AI reads your conversations", cells: [<><Check /> No</>, <><Cross /> Meta AI via "Private Processing"</>] },
          { label: "Cloud backup encrypted", cells: [<><Check /> Always (keys on device)</>, <><Partial /> Optional E2EE backup</>] },
          { label: "Biometric vault (hidden chats)", cells: [<><Check /> Yes</>, <><Cross /> No</>] },
          { label: "Account without phone", cells: [<><Check /> Yes — email or Random ID</>, <><Cross /> No</>] },
          { label: "Contact discovery privacy", cells: [<><Check /> HMAC-hashed — server never sees raw numbers</>, <><Cross /> Uploads full contact list</>] },
          { label: "Encrypted polls", cells: [<><Check /> Yes</>, <><Cross /> No</>] },
          { label: "Scheduled messages", cells: [<><Check /> Yes — encrypted at composition</>, <><Cross /> No</>] },
          { label: "View-once media", cells: [<><Check /> Yes — enforced server-side</>, <><Partial /> Yes — but bypassed in 2024 research</>] },
          { label: "Disappearing messages", cells: [<><Check /> Yes</>, <><Check /> Yes</>] },
          { label: "Per-contact themes", cells: [<><Check /> Yes</>, <><Cross /> No</>] },
          { label: "Revenue model", cells: [<><Check /> None — free, open-source</>, <><Cross /> Advertising + business messaging fees</>] },
        ]}
      />

      <Callout title="View-Once Bypass — WhatsApp 2024" tone="amber">
        In September 2024, security researchers at Zengo X documented four independent methods to bypass WhatsApp's
        view-once feature, allowing recipients to save photos and videos that were meant to be seen only once.
        Meta acknowledged the issue but declined to patch the root cause in some cases. VeilChat enforces
        view-once at the server level — the media URL expires immediately after the first download, and the
        server tombstones the message record.
      </Callout>

      {/* §4 */}
      <H2 id="vs-signal">§4 VeilChat vs Signal — How We Extend the Gold Standard</H2>
      <P>
        Signal is the benchmark for private messaging. We respect it enormously. Our cryptographic core is
        built on the same specifications Signal pioneered. <Cite n={1} /> This section focuses not on security
        parity — both apps use the same Signal Protocol — but on the features and usability dimensions where
        VeilChat goes further.
      </P>

      <CompareTable
        columns={["VeilChat", "Signal"]}
        rows={[
          { label: "Core cryptography", cells: [<><Check /> Signal Protocol</>, <><Check /> Signal Protocol</>] },
          { label: "Forward secrecy", cells: [<><Check /> Yes</>, <><Check /> Yes</>] },
          { label: "Open source", cells: [<><Check /> Yes</>, <><Check /> Yes</>] },
          { label: "Phone number required", cells: [<><Check /> No — Random ID / email</>, <><Partial /> Usernames added 2024, but phone still required for signup</>] },
          { label: "Multiple account types", cells: [<><Check /> 3 types: email, phone, random ID</>, <><Cross /> Phone only</>] },
          { label: "Biometric vault (hidden chats)", cells: [<><Check /> Yes — WebAuthn-backed</>, <><Cross /> No</>] },
          { label: "PWA (no app store needed)", cells: [<><Check /> Yes — install in browser</>, <><Cross /> No — app store required</>] },
          { label: "Encrypted group polls", cells: [<><Check /> Yes</>, <><Cross /> No</>] },
          { label: "Scheduled messages (E2EE)", cells: [<><Check /> Yes</>, <><Cross /> No</>] },
          { label: "Mood / status broadcast (E2EE)", cells: [<><Check /> Yes</>, <><Cross /> No</>] },
          { label: "Discover directory", cells: [<><Check /> Opt-in public directory</>, <><Cross /> No</>] },
          { label: "Per-contact themes", cells: [<><Check /> Yes</>, <><Cross /> No</>] },
          { label: "Link preview privacy", cells: [<><Check /> Fetched server-side, no client IP leak</>, <><Partial /> Fetched client-side in some versions</>] },
          { label: "Android + iOS", cells: [<><Check /> Via PWA + Capacitor APK</>, <><Check /> Native apps</>] },
          { label: "Revenue model", cells: [<><Check /> Donations / free, open-source</>, <><Check /> Non-profit foundation</>] },
        ]}
      />

      <Callout title="A note on Signal" tone="blue">
        Signal is an exceptional application and we recommend it unreservedly to anyone who cannot use VeilChat.
        The comparison above is not a criticism of Signal — it is a description of what VeilChat adds for users
        who want a richer feature set on top of the same cryptographic foundation.
      </Callout>

      {/* §5 */}
      <H2 id="signal-protocol">§5 Signal Protocol — Cryptographic Foundations</H2>
      <P>
        The Signal Protocol is a set of cryptographic specifications developed by Open Whisper Systems (now the
        Signal Foundation) and first published in 2013. <Cite n={1} /> It is the most widely adopted
        end-to-end encryption protocol for real-time messaging, incorporated into Signal, WhatsApp, Google
        Messages, Facebook Messenger's Secret Conversations, and — as of this document — VeilChat.
      </P>
      <P>
        The protocol combines three distinct mechanisms to achieve security properties that no prior messaging
        protocol offered simultaneously:
      </P>
      <ul className="mt-4 space-y-2 text-[17.5px] leading-[1.82] text-[#1f2a23] list-none">
        <li><strong style={{color:"#0F2A18"}}>1. X3DH (Extended Triple Diffie-Hellman)</strong> — establishes an initial shared secret between two parties who may never have met, using long-term and ephemeral key pairs.</li>
        <li><strong style={{color:"#0F2A18"}}>2. Double Ratchet</strong> — derives a unique encryption key for every single message, providing both forward secrecy and break-in recovery.</li>
        <li><strong style={{color:"#0F2A18"}}>3. Prekeys</strong> — allows asynchronous session initiation without both parties being online at the same moment.</li>
      </ul>

      <H3>Key Primitives Used in VeilChat</H3>
      <ul className="mt-4 space-y-2 text-[17px] leading-[1.82] text-[#1f2a23] list-none">
        <li><strong>Ed25519</strong> — Edwards-curve Digital Signature Algorithm for identity keypairs. <Cite n={9} /> Each VeilChat user generates a permanent Ed25519 keypair on their device at signup. The private key never leaves the device.</li>
        <li><strong>X25519 (Curve25519)</strong> — Elliptic-curve Diffie-Hellman for key agreement. <Cite n={10} /> Used in X3DH and the Double Ratchet DH steps.</li>
        <li><strong>AES-256-GCM</strong> — Authenticated encryption for message ciphertext. <Cite n={7} /> Provides both confidentiality and integrity in a single operation.</li>
        <li><strong>HKDF (HMAC-based Key Derivation Function)</strong> — Derives per-message keys from ratchet chain keys. <Cite n={8} /></li>
        <li><strong>HMAC-SHA256</strong> — Message authentication in the ratchet KDF chain. <Cite n={31} /></li>
      </ul>

      <Callout title="Implementation" tone="green">
        VeilChat's cryptographic implementation uses the <code>@noble/curves</code> library by Paul Miller
        for all elliptic-curve operations (Ed25519, X25519). <Cite n={25} /> This library is a pure-JavaScript,
        audited, dependency-free implementation with no native bindings — making it fully auditable and
        reproducible. Symmetric operations use the browser's native <code>SubtleCrypto</code> Web Crypto API,
        which is accelerated by hardware on all modern devices.
      </Callout>

      {/* §6 */}
      <H2 id="double-ratchet">§6 The Double Ratchet Algorithm</H2>
      <P>
        The Double Ratchet Algorithm is the mechanism that ensures every message in a VeilChat conversation is
        encrypted with a unique key — and that compromising one key never compromises past or future keys. <Cite n={2} />
      </P>
      <P>
        The "double" in the name refers to two interleaved ratchets:
      </P>

      <H3>1. The Diffie-Hellman Ratchet</H3>
      <P>
        Each party maintains a current DH ratchet keypair. On first sending a message after receiving from the
        peer, the sender generates a fresh DH keypair and publishes its public component in the message header.
        The receiver combines the sender's new ratchet public key with their own private key to derive a new
        shared DH output. This DH output feeds into the root KDF to advance the root key and produce a new
        chain key. This step gives the protocol <strong>break-in recovery</strong>: even if an attacker
        somehow obtains one DH private key, they cannot compute past or future chain keys without the full
        ratchet history.
      </P>

      <H3>2. The Symmetric Key Ratchet</H3>
      <P>
        Each chain key advances on every message send or receive, producing a unique per-message key (MK) for
        encryption and a new chain key (CK) for the next step. This HMAC-based derivation gives the protocol
        <strong> forward secrecy</strong>: once a message is decrypted, its MK is deleted, making past
        messages irrecoverable even from a fully compromised device.
      </P>

      <Callout title="Skipped messages" tone="amber">
        VeilChat implements the full "skipped message keys" mechanism from the Double Ratchet spec, capping
        stored skip keys at 100 per direction. This handles out-of-order delivery (common in mobile networks)
        without sacrificing security. Skip keys are stored encrypted in the device's IndexedDB and deleted
        immediately after use.
      </Callout>

      {/* §7 */}
      <H2 id="x3dh">§7 X3DH Key Agreement — Session Initiation</H2>
      <P>
        Before Alice can send Bob her first message, their devices must agree on a shared root key without
        having been simultaneously online. The X3DH protocol (Extended Triple Diffie-Hellman) solves this
        using prekeys published to the server in advance. <Cite n={3} />
      </P>

      <H3>Key Material Published to Server (Public Only)</H3>
      <ul className="mt-4 space-y-1.5 text-[17px] text-[#1f2a23]">
        <li><strong>Identity Key (IK)</strong> — Long-term Ed25519 signing keypair. Public key stored on server.</li>
        <li><strong>Signed Prekey (SPK)</strong> — A medium-term X25519 keypair, signed by the identity key and rotated periodically.</li>
        <li><strong>One-Time Prekeys (OPKs)</strong> — A batch of ephemeral X25519 keypairs uploaded in advance. Each is consumed exactly once.</li>
      </ul>

      <H3>Session Establishment (Alice initiates to Bob)</H3>
      <P>
        Alice fetches Bob's public key bundle from the server. She generates an ephemeral keypair (EK) locally.
        She computes four Diffie-Hellman operations:
      </P>
      <div className="mt-4 rounded-xl text-[14.5px] font-mono p-4 overflow-x-auto" style={{ backgroundColor: "#0F2A18", color: "#68BA7F" }}>
        <div>DH1 = DH(Alice.IK.private, Bob.SPK.public)</div>
        <div>DH2 = DH(Alice.EK.private, Bob.IK.public)</div>
        <div>DH3 = DH(Alice.EK.private, Bob.SPK.public)</div>
        <div>DH4 = DH(Alice.EK.private, Bob.OPK.public)</div>
        <div className="mt-2">Root Key = HKDF(DH1 || DH2 || DH3 || DH4)</div>
      </div>
      <P>
        This root key initialises the Double Ratchet. The server only ever saw public keys — no private key
        material ever left either device. Bob's one-time prekey is marked consumed on the server, preventing
        replay attacks. <Cite n={3} />
      </P>

      {/* §8 */}
      <H2 id="group-encryption">§8 Group Encryption — Sender Keys</H2>
      <P>
        Encrypting a message individually for 100 group members would require 100 separate encryption operations —
        expensive and impractical. VeilChat uses the Signal Protocol's Sender Key mechanism to solve this
        efficiently without sacrificing security. <Cite n={11} />
      </P>
      <P>
        Each group member generates a Sender Key — a secret AES-256-GCM key unique to them for that group.
        They distribute their Sender Key to every other member via individual, X3DH-protected 1:1 messages.
        When Alice wants to send a group message, she encrypts it once with her Sender Key. Every recipient
        already holds Alice's Sender Key and can decrypt independently. Adding a new member triggers a fresh
        Sender Key distribution — previous messages remain unreadable to late-joiners.
      </P>
      <Callout title="Group security properties" tone="green">
        <ul className="list-none space-y-1.5">
          <li><Check /> <strong>Forward secrecy at the group level</strong> — Sender Keys are rotated on member add/remove.</li>
          <li><Check /> <strong>Server sees only ciphertext</strong> — group messages are encrypted before upload.</li>
          <li><Check /> <strong>Polls, reactions, edits, deletes</strong> — all transmitted as encrypted envelopes with the same Sender Key mechanism.</li>
          <li><Check /> <strong>100-member cap</strong> — enforced server-side to maintain manageable key distribution overhead.</li>
        </ul>
      </Callout>

      {/* §9 */}
      <H2 id="identity">§9 Identity Management & Account Privacy</H2>
      <P>
        VeilChat offers three account types, each suited to different privacy needs:
      </P>

      <H3>1. Email Account</H3>
      <P>
        Authentication via a one-time password sent to your email address. No password is stored — OTP codes
        are single-use and expire in minutes. Your email address is linked to your account on the server but
        is never shared with other VeilChat users.
      </P>

      <H3>2. Phone Account</H3>
      <P>
        Authentication via SMS OTP delivered through Firebase. Your phone number is HMAC-hashed with a
        server-side pepper before storage — the raw number is not stored in plaintext. Contact discovery
        works by hashing your contacts' numbers with a fresh per-session salt, comparing hashes server-side,
        and returning matches — the server never sees raw phone numbers. <Cite n={31} />
      </P>

      <H3>3. Random ID Account — Full Anonymity</H3>
      <P>
        No phone number. No email. No personal information whatsoever. Your identity is an Ed25519 keypair
        generated entirely on your device. The server knows nothing about you beyond a random UUID and your
        public cryptographic keys. Authentication is performed by signing a server-issued challenge with your
        private key — a zero-knowledge proof that you control the private key without revealing it.
        Recovery is provided solely by the 12-word BIP-39 mnemonic generated at signup. <Cite n={6} />
      </P>

      <H3>Passkeys / WebAuthn</H3>
      <P>
        All account types support passkey enrollment for subsequent logins. <Cite n={5} /> Passkeys are
        bound to your device's secure enclave (Touch ID, Face ID, Windows Hello, Android fingerprint) and
        can replace OTP codes entirely for returning users. Passkeys are stored locally — VeilChat's server
        only receives the public credential ID and public key, never the private key or biometric data.
      </P>

      <H3>Session Management</H3>
      <P>
        Sessions use short-lived JWT access tokens (15-minute expiry) and long-lived refresh tokens (90-day
        expiry). The refresh token is stored in an HttpOnly cookie where possible, and in localStorage as a
        fallback for cross-origin deployments (Vercel frontend ↔ Render backend). Sessions can be revoked
        from the Settings screen, invalidating all tokens immediately.
      </P>

      {/* §10 */}
      <H2 id="vault">§10 The Vault — Biometric-Protected Private Space</H2>
      <P>
        The Vault is a hidden layer inside VeilChat — a biometric-locked private space that conceals selected
        conversations from the main chat list. It is designed for users who share a device, operate in
        high-surveillance environments, or simply want an additional layer of separation between different
        areas of their communication.
      </P>

      <H3>How It Works</H3>
      <ul className="mt-4 space-y-2 text-[17px] leading-[1.82] text-[#1f2a23] list-none">
        <li><strong>Enrollment</strong> — The user registers a platform WebAuthn credential (fingerprint, Face ID, PIN) as their Vault unlock mechanism. The credential is stored by the device's secure enclave, not on VeilChat's servers.</li>
        <li><strong>Vault flag</strong> — Any conversation can be moved into the Vault. A boolean <code>vaulted</code> flag is set in the device's IndexedDB (never synced to server). Vaulted chats are excluded from all main-screen queries.</li>
        <li><strong>Auto-lock</strong> — The Vault session token lives only in in-memory Zustand store. It is never written to localStorage or IndexedDB. Closing the browser tab, refreshing the page, or navigating away automatically re-locks the Vault.</li>
        <li><strong>Unlock</strong> — The user taps "Unlock Vault," the browser presents a biometric/PIN prompt via the WebAuthn API, and on success the Vault session is set in memory. Vaulted chats become visible for the duration of that session.</li>
      </ul>

      <Callout title="What the Vault protects against" tone="green">
        If someone picks up an unlocked VeilChat session (e.g., an unattended phone), they see only non-vaulted
        chats. Vaulted conversations are invisible without a successful biometric authentication. The Vault does
        not add a separate encryption layer — messages remain E2EE regardless — but it provides a crucial
        social engineering and physical access protection layer.
      </Callout>

      {/* §11 */}
      <H2 id="what-we-store">§11 What VeilChat Stores — Full Transparency</H2>
      <P>
        The following is an exhaustive list of what VeilChat's server stores. We publish this not as a legal
        disclaimer but as a genuine commitment to radical transparency.
      </P>

      <div className="mt-6 space-y-3">
        {[
          ["User ID", "A randomly generated UUID assigned at account creation. Not derived from any personal information for Random ID accounts."],
          ["Account type", "Email, phone, or random — determines authentication method."],
          ["Email address (email accounts only)", "Stored hashed (bcrypt). Used only for OTP delivery. Never shared with other users."],
          ["Phone number identifier (phone accounts only)", "Stored as an HMAC-SHA256 hash with a server-side pepper. The raw number is not stored."],
          ["Display name & username", "Chosen by the user. Publicly visible to connections."],
          ["Profile photo", "Optional. Stored on Cloudflare R2, served via signed URLs."],
          ["Identity public key (Ed25519)", "Used by other clients to verify your identity. The private key is never seen by the server."],
          ["Signed Prekey public key + signature", "Used by peers to initiate X3DH sessions. Rotated periodically by the client."],
          ["One-Time Prekey public keys", "A batch of public keys uploaded in advance. Each consumed exactly once per incoming session."],
          ["Encrypted message blobs", "Opaque ciphertext the server cannot decrypt. Stored temporarily until delivery confirmed, then eligible for sweeping."],
          ["Message delivery timestamps", "When a message was received and when it was delivered — not its content."],
          ["Push tokens", "FCM or Web Push subscription endpoints, used to deliver push notifications. Contain no message content."],
          ["Session metadata", "Refresh token hash, creation time, expiry — no device fingerprint or IP stored permanently."],
          ["Group metadata", "Group name, avatar, member list (user IDs only), epoch counter for Sender Key rotation."],
          ["Connection graph", "A record of which pairs of users are connected (for routing messages). Not shared with third parties."],
          ["Scheduled message blobs", "Encrypted ciphertext held temporarily until the scheduled delivery time, then released and deleted."],
          ["Security alerts", "Timestamps of login events, new device enrollments — used to notify users of suspicious activity."],
        ].map(([field, desc]) => (
          <div key={field} className="rounded-xl px-4 py-3" style={{ backgroundColor: "rgba(255,255,255,0.7)", border: "1px solid rgba(15,42,24,0.08)" }}>
            <div className="text-[15px] font-semibold" style={{ color: "#0F2A18" }}>{field}</div>
            <div className="mt-0.5 text-[15px] leading-[1.65]" style={{ color: "#4a5a4f" }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* §12 */}
      <H2 id="what-we-dont">§12 What VeilChat Does NOT Store</H2>
      <Callout title="Not stored — ever" tone="green">
        <ul className="list-none space-y-1.5">
          <li><Check /> <strong>Message plaintext</strong> — the server receives and stores only opaque ciphertext.</li>
          <li><Check /> <strong>Media content</strong> — encrypted blobs stored on Cloudflare R2 under keys derived on the client. The server holds only encrypted file metadata.</li>
          <li><Check /> <strong>Contact lists</strong> — your address book is never uploaded to VeilChat's servers.</li>
          <li><Check /> <strong>Location data</strong> — VeilChat does not request, collect, or infer location.</li>
          <li><Check /> <strong>Behavioral analytics</strong> — no usage tracking, no session recordings, no heatmaps, no A/B test data.</li>
          <li><Check /> <strong>Advertising identifiers</strong> — no IDFA, GAID, or any advertising ID.</li>
          <li><Check /> <strong>Read receipt content</strong> — delivery and read events are transmitted as encrypted receipts; the server does not log them permanently.</li>
          <li><Check /> <strong>Typing indicators</strong> — transmitted peer-to-peer via WebSocket, never persisted to the database.</li>
          <li><Check /> <strong>IP address logs</strong> — IP addresses are used transiently for WebSocket routing and not written to persistent storage.</li>
          <li><Check /> <strong>Private keys</strong> — under no circumstances does the server receive, handle, or store any user's private cryptographic key.</li>
          <li><Check /> <strong>Reaction content</strong> — reactions are encrypted envelopes; the server sees only that an envelope was delivered.</li>
          <li><Check /> <strong>Poll votes</strong> — poll votes are encrypted with the group Sender Key; the server cannot see who voted for what.</li>
        </ul>
      </Callout>

      {/* §13 */}
      <H2 id="open-source">§13 Open Source — Auditability & Trust</H2>
      <P>
        VeilChat's entire codebase — client, server, and shared packages — is published under an open-source
        licence on GitHub. This is not a marketing claim. It is a structural guarantee: anyone who wants to
        verify that VeilChat behaves as described in this document can read the exact code running in
        production.
      </P>
      <P>
        Open source provides security properties that no closed-source application can match:
      </P>
      <ul className="mt-4 space-y-2 text-[17px] leading-[1.82] text-[#1f2a23] list-none">
        <li><Check /> <strong>Auditable cryptography</strong> — security researchers can verify that the Signal Protocol implementation is correct, complete, and free of backdoors.</li>
        <li><Check /> <strong>No hidden telemetry</strong> — every network call the client makes is visible in the code. There are no secret analytics endpoints.</li>
        <li><Check /> <strong>Reproducible claims</strong> — every architectural statement in this document can be cross-referenced with a specific file and function in the repository.</li>
        <li><Check /> <strong>Community scrutiny</strong> — independent security researchers can file issues, propose audits, and submit pull requests.</li>
        <li><Check /> <strong>Trust by verification</strong> — users do not need to trust VeilChat's word. They can trust the code.</li>
      </ul>

      <Callout title="Repository" tone="blue">
        The full source code is available at{" "}
        <a href="https://github.com/rupeshsahu408/VeilChat" target="_blank" rel="noopener noreferrer" style={{ color: "#2E5FAF" }} className="underline">
          github.com/rupeshsahu408/VeilChat
        </a>. The cryptographic core lives in <code>apps/client/src/lib/signal/</code>. The server schema
        lives in <code>apps/server/src/db/schema.ts</code>. The API surface is fully typed via tRPC in
        <code> apps/server/src/trpc/routers/</code>.
      </Callout>

      {/* §14 */}
      <H2 id="features">§14 Complete Feature Reference</H2>
      <P>The following is an exhaustive list of VeilChat features as of the current release.</P>

      <H3>Messaging</H3>
      <div className="mt-3 flex flex-wrap">
        {[
          "End-to-end encrypted 1:1 messages",
          "End-to-end encrypted group chats (up to 100 members)",
          "Text messages with Markdown support",
          "Image sharing (E2EE, via R2)",
          "Voice messages (E2EE)",
          "File attachments (E2EE)",
          "Link previews (server-fetched, no client IP leak)",
          "Emoji reactions",
          "Swipe to reply",
          "Message quoting / reply threads",
          "Edit message (for everyone)",
          "Delete message (for everyone)",
          "Star messages",
          "Pin messages",
          "Forward messages",
          "Typing indicators (real-time, not persisted)",
          "Message delivery ticks",
          "Message read receipts",
        ].map((f) => <FeatureTag key={f} label={f} />)}
      </div>

      <H3>Privacy & Security</H3>
      <div className="mt-3 flex flex-wrap">
        {[
          "Disappearing messages (configurable timer)",
          "View-once media",
          "Biometric Vault (hidden chats)",
          "Screen privacy blur (when app is backgrounded)",
          "Contact blocking",
          "Abuse reporting",
          "Last-seen visibility controls",
          "Privacy-preserving contact discovery (HMAC hashed)",
          "No ads, no tracking",
          "Zero-knowledge server architecture",
        ].map((f) => <FeatureTag key={f} label={f} />)}
      </div>

      <H3>Advanced Features</H3>
      <div className="mt-3 flex flex-wrap">
        {[
          "Encrypted group polls",
          "Scheduled messages (E2EE at composition time)",
          "Mood / status broadcast (E2EE)",
          "Focus Mode / quiet hours",
          "Per-contact custom themes",
          "Per-contact custom wallpapers",
          "Per-contact private nicknames",
          "Sound notifications per contact",
          "Group admin controls (add/remove/promote members)",
          "Group mentions (@mention)",
          "Group invite links",
          "Discover people directory (opt-in)",
          "Invite system (shareable links)",
        ].map((f) => <FeatureTag key={f} label={f} />)}
      </div>

      <H3>Account & Identity</H3>
      <div className="mt-3 flex flex-wrap">
        {[
          "Email account (OTP login, no password)",
          "Phone account (SMS OTP)",
          "Random ID account (zero personal info)",
          "Passkey / WebAuthn support",
          "BIP-39 recovery phrase (12 words)",
          "Daily PIN for device identity unlock",
          "Multi-session management",
          "New-device confirmation flow",
          "Session revocation",
        ].map((f) => <FeatureTag key={f} label={f} />)}
      </div>

      <H3>Platform</H3>
      <div className="mt-3 flex flex-wrap">
        {[
          "Progressive Web App (PWA) — install on any device",
          "Android APK (via Capacitor)",
          "Web Push Notifications",
          "FCM notifications (Android)",
          "APNs notifications (iOS via Capacitor)",
          "Offline support (IndexedDB via Dexie)",
          "WebSocket real-time message delivery",
          "Cloudflare R2 encrypted media storage",
          "Multiple UI themes (light, dark, system)",
        ].map((f) => <FeatureTag key={f} label={f} />)}
      </div>

      {/* §15 */}
      <H2 id="high-profile">§15 Security for High-Profile Individuals</H2>
      <P>
        Journalists, politicians, lawyers, doctors, activists, business executives, and anyone facing elevated
        surveillance risk have specific requirements beyond what mainstream messaging apps provide. VeilChat
        was designed with these users in mind.
      </P>

      <H3>No Phone Number — No Paper Trail</H3>
      <P>
        A Random ID VeilChat account requires zero personal information at signup. No phone number, no email,
        no real name. Your identity is a cryptographic keypair generated on your device. This means:
      </P>
      <ul className="mt-3 space-y-1.5 text-[17px] text-[#1f2a23] list-none">
        <li><Check /> A subpoena to VeilChat's server for "all information about user X" yields: a UUID, a public key, and encrypted ciphertext — nothing personally identifying.</li>
        <li><Check /> There is no subscriber information to hand over because there is none.</li>
        <li><Check /> Your communications are not linkable to your phone number through carrier records.</li>
      </ul>

      <H3>The Vault for Physical Security</H3>
      <P>
        Device confiscation is a real risk for journalists and activists. The Vault ensures that even an
        unlocked, unattended VeilChat session does not reveal protected conversations. Vaulted chats are
        completely invisible in the normal chat list — there is no indicator that a Vault exists unless the
        user navigates to the dedicated Vault page and authenticates biometrically.
      </P>

      <H3>Zero Server Knowledge of Content</H3>
      <P>
        If VeilChat's servers were seized, breached, or compelled by legal process, the attacker would receive
        encrypted ciphertext that cannot be decrypted without the private keys on users' devices. This is not
        a policy promise — it is a cryptographic guarantee. The architecture makes content disclosure
        structurally impossible, not merely contractually prohibited.
      </P>

      <H3>BIP-39 Recovery — No Server Dependency</H3>
      <P>
        Recovery does not involve VeilChat's servers. The 12-word mnemonic phrase generated at signup encodes
        all key material needed to restore an account on a new device. A journalist whose device is seized or
        destroyed can recover their account on a new device using only the phrase — no email verification,
        no SMS, no server-side recovery flow that could be subpoenaed.
      </P>

      <H3>Open Source for Institutional Trust</H3>
      <P>
        Intelligence agencies, newsrooms, law firms, and NGOs that vet communication tools for their members
        can audit VeilChat's code directly. No trust in VeilChat's word is required. Security teams can
        verify the absence of backdoors, the correctness of the cryptographic implementation, and the
        completeness of the server-side data minimization — all from the public repository.
      </P>

      <Callout title="Responsible disclosure" tone="blue">
        VeilChat maintains a responsible disclosure policy. Security researchers who discover vulnerabilities
        are asked to contact the team privately before public disclosure. We commit to acknowledging valid
        reports within 48 hours and publishing a fix timeline within 7 days.
      </Callout>

      {/* §16 */}
      <H2 id="tech-stack">§16 Technology Stack — Full Technical Reference</H2>

      <H3>Client (apps/client/)</H3>
      <ul className="mt-3 space-y-1.5 text-[16px] text-[#28332c] list-none">
        <li><strong>React 18</strong> — UI component framework</li>
        <li><strong>Vite 5</strong> — Build toolchain with lightning-fast HMR</li>
        <li><strong>TypeScript 5</strong> — Static type safety across the entire codebase</li>
        <li><strong>Tailwind CSS 3</strong> — Utility-first styling</li>
        <li><strong>Zustand</strong> — Lightweight global state management</li>
        <li><strong>Dexie.js (IndexedDB)</strong> — Client-side encrypted message storage and session state <Cite n={29} /></li>
        <li><strong>react-router-dom 6</strong> — Client-side routing</li>
        <li><strong>@trpc/react-query</strong> — End-to-end typesafe API calls <Cite n={21} /></li>
        <li><strong>@tanstack/react-query 5</strong> — Server state management and caching</li>
        <li><strong>framer-motion</strong> — Fluid UI animations</li>
        <li><strong>vite-plugin-pwa</strong> — Service worker, offline support, installability <Cite n={24} /></li>
        <li><strong>@noble/curves</strong> — Ed25519 and X25519 cryptography (audited, zero dependencies) <Cite n={25} /></li>
        <li><strong>hash-wasm</strong> — WASM-accelerated hash functions</li>
        <li><strong>Capacitor</strong> — Android APK packaging from the web codebase <Cite n={33} /></li>
        <li><strong>react-hook-form</strong> — Form management</li>
      </ul>

      <H3>Server (apps/server/)</H3>
      <ul className="mt-3 space-y-1.5 text-[16px] text-[#28332c] list-none">
        <li><strong>Node.js 20+</strong> — Runtime</li>
        <li><strong>Fastify</strong> — High-performance HTTP framework <Cite n={20} /></li>
        <li><strong>tRPC 11</strong> — Type-safe API layer (no REST, no GraphQL, no schema drift) <Cite n={21} /></li>
        <li><strong>Drizzle ORM</strong> — Type-safe Postgres ORM with migrations <Cite n={19} /></li>
        <li><strong>postgres-js</strong> — Postgres driver</li>
        <li><strong>jose</strong> — JWT signing and verification (access + refresh tokens)</li>
        <li><strong>bcryptjs</strong> — Password and token hashing</li>
        <li><strong>@fastify/cors</strong> — Configurable CORS with wildcard support</li>
        <li><strong>@fastify/cookie</strong> — HttpOnly cookie management for refresh tokens</li>
        <li><strong>Resend</strong> — Transactional email for OTP delivery</li>
        <li><strong>WebSocket (ws)</strong> — Real-time message delivery and typing indicators</li>
        <li><strong>web-push</strong> — Web Push Notifications (VAPID)</li>
        <li><strong>Firebase Admin</strong> — FCM push for Android, phone OTP verification</li>
      </ul>

      <H3>Infrastructure</H3>
      <ul className="mt-3 space-y-1.5 text-[16px] text-[#28332c] list-none">
        <li><strong>Neon Postgres</strong> — Serverless, branching Postgres database <Cite n={22} /></li>
        <li><strong>Cloudflare R2</strong> — Zero-egress encrypted media storage <Cite n={23} /></li>
        <li><strong>Firebase</strong> — Phone OTP (Firebase Auth), FCM push notifications</li>
        <li><strong>Resend</strong> — Email OTP delivery</li>
        <li><strong>Render</strong> — Backend hosting (current production)</li>
        <li><strong>Vercel</strong> — Frontend hosting (current production)</li>
      </ul>

      <H3>Monorepo Structure</H3>
      <div className="mt-4 rounded-xl text-[13.5px] font-mono p-4 overflow-x-auto leading-relaxed" style={{ backgroundColor: "#0F2A18", color: "#a8d4b4" }}>
        <div style={{color:"#68BA7F"}}>/ (pnpm workspace)</div>
        <div>├── apps/</div>
        <div>│   ├── client/     ← React 18 + Vite PWA (port 5000)</div>
        <div>│   │   └── src/lib/signal/  ← Signal Protocol implementation</div>
        <div>│   └── server/     ← Fastify + tRPC API (port 3001)</div>
        <div>│       └── src/db/schema.ts ← Full Drizzle DB schema</div>
        <div>└── packages/</div>
        <div>    └── shared/     ← Zod schemas + TypeScript types (shared)</div>
      </div>

      {/* §17 */}
      <H2 id="threat-model">§17 Threat Model — What VeilChat Protects Against</H2>

      <H3>✓ Protects Against</H3>
      <ul className="mt-3 space-y-2 text-[17px] leading-[1.82] text-[#1f2a23] list-none">
        <li><Check /> <strong>Server breach</strong> — A full database dump yields only encrypted ciphertext, public keys, UUIDs, and delivery timestamps. No message content, no media, no private keys.</li>
        <li><Check /> <strong>Network interception</strong> — All communication is encrypted end-to-end. TLS in transit, E2EE in storage. A man-in-the-middle attacker sees only ciphertext.</li>
        <li><Check /> <strong>Government compulsion (content requests)</strong> — VeilChat cannot comply with a content production order because there is no readable content to produce. The server holds opaque ciphertext.</li>
        <li><Check /> <strong>Advertising profiling</strong> — No behavioral data is collected. There is no advertising infrastructure.</li>
        <li><Check /> <strong>Contact graph leakage</strong> — VeilChat knows which users are connected (needed for routing) but minimizes this. Contact books are never uploaded.</li>
        <li><Check /> <strong>Physical device access (Vault)</strong> — Hidden conversations are biometrically protected and invisible without authentication.</li>
        <li><Check /> <strong>Replay attacks</strong> — One-time prekeys are consumed and cannot be reused. Ratchet state is non-replayable.</li>
        <li><Check /> <strong>Past message compromise</strong> — Forward secrecy via the Double Ratchet means past message keys are deleted after use.</li>
        <li><Check /> <strong>Future message compromise</strong> — Break-in recovery means a compromised ratchet state is automatically healed on the next DH ratchet step.</li>
      </ul>

      <H3>✗ Does Not Protect Against</H3>
      <ul className="mt-3 space-y-2 text-[17px] leading-[1.82] text-[#1f2a23] list-none">
        <li><Cross /> <strong>Compromised endpoint</strong> — If your device has malware or a keylogger, all E2EE guarantees are void. The encryption operates correctly but the adversary can read plaintext before encryption or after decryption.</li>
        <li><Cross /> <strong>Recipient screenshots</strong> — VeilChat cannot prevent a recipient from photographing their screen or using another device to capture a message.</li>
        <li><Cross /> <strong>Shoulder surfing</strong> — Physical observation of your screen is outside VeilChat's threat model.</li>
        <li><Cross /> <strong>Identity fraud at signup</strong> — VeilChat cannot verify that a user is who they claim to be. Identity verification is not part of the protocol.</li>
        <li><Cross /> <strong>Nation-state zero-day exploits</strong> — A sufficiently resourced attacker who compromises the device OS or browser before VeilChat runs can circumvent all application-layer security.</li>
        <li><Cross /> <strong>Social engineering</strong> — If a user is tricked into revealing their recovery phrase or sharing a screenshot, VeilChat cannot protect that information.</li>
        <li><Cross /> <strong>Traffic analysis at scale</strong> — VeilChat minimizes metadata but cannot fully prevent correlation attacks if an adversary controls the user's entire network path.</li>
      </ul>

      {/* §18 */}
      <H2 id="limitations">§18 Honest Limitations</H2>
      <P>
        We believe radical honesty about limitations builds more trust than overstating security guarantees.
        The following are known limitations that users should understand before relying on VeilChat for
        high-stakes communication.
      </P>
      <Callout title="Limitations to be aware of" tone="amber">
        <ul className="list-none space-y-2">
          <li><strong>Recovery phrase is the only recovery mechanism for Random ID accounts.</strong> If you lose your 12-word phrase and your device simultaneously, your account and message history cannot be recovered. There is no server-side backup of private keys.</li>
          <li><strong>The server knows your connection graph.</strong> VeilChat knows which user IDs are connected to which other user IDs — this is required for routing. The content of those connections is encrypted, but the existence of the relationship is known to the server.</li>
          <li><strong>Media stored on Cloudflare R2 persists until swept.</strong> Encrypted media files are subject to a background sweeper that deletes expired blobs, but between upload and sweep, encrypted ciphertext exists on R2.</li>
          <li><strong>PWA limitations on iOS.</strong> Apple restricts service workers and WebPush on iOS Safari in ways that can affect notification delivery. This is a platform limitation, not a VeilChat design choice.</li>
          <li><strong>Phone number accounts link your number.</strong> If you sign up with a phone number, VeilChat stores a hashed version of it. A subpoena could compel VeilChat to confirm whether a specific phone number has an account — though not reveal any message content.</li>
        </ul>
      </Callout>

      {/* §19 */}
      <H2 id="compliance">§19 Compliance & Jurisdiction</H2>
      <P>
        VeilChat is designed with data minimization as a first principle, which aligns naturally with the
        requirements of major privacy regulations:
      </P>
      <ul className="mt-4 space-y-2 text-[17px] leading-[1.82] text-[#1f2a23] list-none">
        <li><Check /> <strong>GDPR (EU)</strong> — Data minimization, purpose limitation, and storage limitation principles are satisfied by design. <Cite n={30} /> No personal data is shared with third parties for advertising. Users can delete their accounts and all associated server-side data at any time.</li>
        <li><Check /> <strong>Government content requests</strong> — VeilChat cannot comply with content production orders because no readable content exists on the server. The architectural response to lawful interception is "nothing to give."</li>
        <li><Check /> <strong>Metadata requests</strong> — VeilChat may be compelled to produce: account creation timestamp, last activity timestamp, and the user's UUID. No message content, no contact list, no behavioral profile, no private key material.</li>
        <li><Check /> <strong>Right to erasure</strong> — Users can delete their account from Settings. Deletion removes: the user record, all messages addressed to them, all prekeys, all push tokens, and all connection records. Encrypted blobs in group messages sent by the user are tombstoned (content replaced with a deletion marker).</li>
      </ul>

      {/* §20 */}
      <H2 id="conclusion">§20 Conclusion</H2>
      <P>
        Privacy is not a feature to be unlocked by a subscription tier. It is a right — and it should be the
        default, not an opt-in. VeilChat was built on this principle from the very first line of code.
      </P>
      <P>
        Every message you send through VeilChat is encrypted on your device before it leaves. The server
        that routes your message cannot read it. The company that runs VeilChat cannot read it. No advertiser,
        no data broker, no government agency with a server-side warrant can read it — because there is nothing
        readable to read.
      </P>
      <P>
        You do not have to trust this statement. You can read every line of code that makes it true.
        The repository is public. The cryptographic specifications are public. The threat model above is honest
        about what VeilChat protects and what it does not. We believe that honest, auditable privacy — even
        with its limitations clearly stated — is infinitely more valuable than opaque, marketing-driven
        assurances.
      </P>
      <P>
        VeilChat is free. It will remain free. It has no advertising revenue model to protect and no
        corporate parent to answer to. It is built for the people who understand that private
        conversations should stay private — and who are willing to choose a tool built around that
        principle rather than around growth metrics.
      </P>
      <Callout title="Get started" tone="green">
        VeilChat is available now at <a href="https://www.veilchat.me" className="underline font-semibold" style={{color:"#2E6F40"}}>veilchat.me</a>.
        Open it in any modern browser, install it to your home screen or desktop, and send your first
        encrypted message in under two minutes. No phone number required. No app store. Free forever.
      </Callout>
    </>
  );
}

/* ── main component ── */

export function WhitepaperPage() {
  useDocumentMeta({
    title: "VeilChat Security & Privacy Whitepaper",
    description:
      "A comprehensive technical analysis of how VeilChat protects your privacy — Signal Protocol, zero-knowledge server, open source, and more.",
  });

  const pct = useReadingProgress();
  const [lang, setLang] = useState<Lang>(detectLang);
  const [shareLabel, setShareLabel] = useState<string>("");
  const isRTL = RTL_LANGS.has(lang);
  const t = T[lang];
  const readingMinutes = 28;

  useEffect(() => {
    try { localStorage.setItem("veil:wp_lang", lang); } catch { /* ignore */ }
  }, [lang]);

  useEffect(() => {
    if (shareLabel) {
      const timer = setTimeout(() => setShareLabel(""), 2500);
      return () => clearTimeout(timer);
    }
  }, [shareLabel]);

  const handleDownload = () => window.print();

  const handleShare = async () => {
    const url = window.location.href;
    const title = "VeilChat Security & Privacy Whitepaper";
    const text = "A comprehensive technical analysis of how VeilChat protects your privacy.";
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        setShareLabel(t.shared);
      } else {
        await navigator.clipboard.writeText(url);
        setShareLabel(t.copied);
      }
    } catch { /* user cancelled */ }
  };

  const nonEnglishNote = useMemo(() => {
    if (lang === "en") return null;
    return t.nonEnglishNote;
  }, [lang, t]);

  return (
    <div
      className="min-h-screen antialiased"
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        backgroundColor: "#FCF5EB",
        color: "#111B21",
        fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* ── print CSS ── */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          article { padding: 0 !important; }
          a { color: inherit !important; text-decoration: none !important; }
          .scroll-mt-24 { scroll-margin-top: 0 !important; }
        }
        @media screen {
          .print-only { display: none !important; }
        }
      `}</style>

      {/* ── reading progress ── */}
      <div
        aria-hidden
        className="fixed top-0 left-0 right-0 h-[3px] z-50 no-print"
        style={{ backgroundColor: "transparent" }}
      >
        <div
          className="h-full"
          style={{ width: `${pct}%`, backgroundColor: "#2E6F40", transition: "width 80ms linear" }}
        />
      </div>

      {/* ── header ── */}
      <header className="no-print max-w-[1200px] mx-auto px-5 sm:px-8 py-5 flex items-center justify-between gap-3 flex-wrap">
        <Link to="/" className="flex items-center gap-2 group">
          <span
            aria-hidden
            className="grid place-items-center w-8 h-8 rounded-lg text-white font-bold"
            style={{ backgroundColor: "#2E6F40" }}
          >
            ✓
          </span>
          <span className="font-semibold text-[#0F2A18] group-hover:opacity-80">VeilChat</span>
        </Link>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Language selector */}
          <label className="sr-only" htmlFor="wp-lang-select">Choose language</label>
          <select
            id="wp-lang-select"
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
            className="rounded-full border px-3 py-1.5 text-sm font-medium cursor-pointer focus:outline-none focus:ring-2"
            style={{
              borderColor: "rgba(15,42,24,0.15)",
              backgroundColor: "rgba(255,255,255,0.7)",
              color: "#0F2A18",
            }}
          >
            {ALL_LANGS.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>

          {/* Download PDF */}
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border hover:opacity-80 transition-opacity"
            style={{ borderColor: "rgba(15,42,24,0.2)", color: "#0F2A18", backgroundColor: "rgba(255,255,255,0.8)" }}
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2v8M5 7l3 3 3-3" /><path d="M3 13h10" />
            </svg>
            {t.download}
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border hover:opacity-80 transition-opacity"
            style={{ borderColor: "rgba(15,42,24,0.2)", color: "#0F2A18", backgroundColor: "rgba(255,255,255,0.8)" }}
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="3" r="1.5" /><circle cx="12" cy="13" r="1.5" /><circle cx="4" cy="8" r="1.5" />
              <path d="M10.5 3.7L5.5 7.3M10.5 12.3L5.5 8.7" />
            </svg>
            {shareLabel || t.share}
          </button>

          <Link
            to="/welcome"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium hover:opacity-90"
            style={{ backgroundColor: "#2E6F40" }}
          >
            {t.tryVeilChat}
          </Link>
        </div>
      </header>

      {/* ── hero ── */}
      <section className="max-w-[820px] mx-auto px-5 sm:px-8 pt-6 pb-2">
        {/* print-only title */}
        <div className="print-only mb-6">
          <div className="text-[28px] font-bold" style={{ color: "#0F2A18" }}>VeilChat</div>
        </div>
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium tracking-wide uppercase"
          style={{ backgroundColor: "#E8F3E5", color: "#2E6F40" }}
        >
          <span aria-hidden>🔒</span> {t.badge}
        </div>
        <h1
          className="mt-5 text-[38px] sm:text-[52px] leading-[1.06] font-semibold tracking-tight"
          style={{ color: "#0F2A18", fontFamily: "'Fraunces','Inter',serif" }}
        >
          {t.title}
        </h1>
        <p className="mt-5 text-[18.5px] leading-[1.75]" style={{ color: "#28332c" }}>
          {t.lead}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm" style={{ color: "#4a5a4f" }}>
          <span>{t.readingTime} · ~{readingMinutes} min</span>
          <span aria-hidden>·</span>
          <span>{REFS.length} {t.sources}</span>
          <span aria-hidden>·</span>
          <span>{t.updated} {new Date().getFullYear()}</span>
          <span aria-hidden>·</span>
          <span>Version 1.0</span>
        </div>

        {/* Download + Share row (also visible in hero for quick access) */}
        <div className="no-print mt-5 flex flex-wrap gap-2">
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#2E6F40", color: "white" }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2v8M5 7l3 3 3-3" /><path d="M3 13h10" />
            </svg>
            {t.download}
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold border transition-opacity hover:opacity-80"
            style={{ border: "1px solid rgba(15,42,24,0.2)", color: "#0F2A18", backgroundColor: "rgba(255,255,255,0.7)" }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="3" r="1.5" /><circle cx="12" cy="13" r="1.5" /><circle cx="4" cy="8" r="1.5" />
              <path d="M10.5 3.7L5.5 7.3M10.5 12.3L5.5 8.7" />
            </svg>
            {shareLabel || t.share}
          </button>
        </div>
      </section>

      {/* ── non-English note ── */}
      {nonEnglishNote && (
        <div className="no-print max-w-[820px] mx-auto px-5 sm:px-8 mt-6">
          <div className="rounded-xl px-4 py-3 text-[14.5px]" style={{ backgroundColor: "rgba(46,111,64,0.1)", color: "#1F4F2D" }}>
            ℹ️ {nonEnglishNote}
          </div>
        </div>
      )}

      {/* ── TOC ── */}
      <nav
        aria-label={t.tocLabel}
        className="no-print max-w-[820px] mx-auto px-5 sm:px-8 mt-10"
      >
        <div
          className="rounded-2xl px-5 py-5 backdrop-blur"
          style={{ border: "1px solid rgba(226,223,214,1)", backgroundColor: "rgba(255,255,255,0.6)" }}
        >
          <div className="text-[11px] uppercase tracking-widest font-semibold mb-3" style={{ color: "#5b6c61" }}>
            {t.tocLabel}
          </div>
          <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 list-none">
            {TOC_ITEMS.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="text-[14.5px] hover:underline"
                  style={{ color: "#1f2a24" }}
                  onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = "#2E6F40")}
                  onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = "#1f2a24")}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </nav>

      {/* ── article ── */}
      <article className="max-w-[820px] mx-auto px-5 sm:px-8 pb-20 mt-10">
        <Article />

        {/* References */}
        <H2 id="refs">{t.sourcesHeading}</H2>
        <ol className="mt-5 space-y-3 list-none">
          {REFS.map((r) => (
            <li
              id={`ref-${r.n}`}
              key={r.n}
              className="rounded-xl px-4 py-3"
              style={{ backgroundColor: "rgba(255,255,255,0.6)", border: "1px solid rgba(15,42,24,0.07)" }}
            >
              <div className="flex gap-3">
                <span className="font-bold tabular-nums w-7 shrink-0 text-[14px]" style={{ color: "#2E6F40" }}>
                  [{r.n}]
                </span>
                <div className="text-[14.5px] leading-[1.65]">
                  <span className="font-medium" style={{ color: "#0F2A18" }}>{r.title}</span>
                  <span style={{ color: "#4a5a4f" }}> · {r.publisher}</span>
                  {r.date && <span style={{ color: "#4a5a4f" }}> · {r.date}</span>}
                  <div className="break-all mt-0.5">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-[13px]"
                      style={{ color: "#2E6F40" }}
                    >
                      {r.url}
                    </a>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>

        {/* Methodology */}
        <Callout title={t.methodology} tone="blue">
          {t.corrections}
        </Callout>

        {/* CTA */}
        <div className="no-print mt-14 flex flex-wrap items-center gap-3">
          <Link
            to="/welcome"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-white font-medium hover:opacity-90"
            style={{ backgroundColor: "#2E6F40" }}
          >
            {t.tryVeilChat}
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-medium hover:opacity-80 border"
            style={{ color: "#0F2A18", borderColor: "rgba(15,42,24,0.15)" }}
          >
            {t.backHome}
          </Link>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-medium hover:opacity-80 border"
            style={{ color: "#0F2A18", borderColor: "rgba(15,42,24,0.15)" }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2v8M5 7l3 3 3-3" /><path d="M3 13h10" />
            </svg>
            {t.download}
          </button>
        </div>
      </article>

      {/* ── footer ── */}
      <footer className="no-print border-t" style={{ borderColor: "rgba(226,223,214,1)", backgroundColor: "rgba(255,255,255,0.4)" }}>
        <div
          className="max-w-[1200px] mx-auto px-5 sm:px-8 py-7 flex flex-wrap items-center justify-between gap-3 text-sm"
          style={{ color: "#4a5a4f" }}
        >
          <div>
            © {new Date().getFullYear()} VeilChat. {t.footerCopy}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            <Link to="/" className="hover:text-[#0F2A18]">Home</Link>
            <Link to="/blog" className="hover:text-[#0F2A18]">Blog</Link>
            <Link to="/promises" className="hover:text-[#0F2A18]">Promises</Link>
            <Link to="/what-we-store" className="hover:text-[#0F2A18]">What we store</Link>
            <Link to="/encryption" className="hover:text-[#0F2A18]">Encryption</Link>
            <Link to="/open-source" className="hover:text-[#0F2A18]">Open source</Link>
            <Link to="/privacy-policy" className="hover:text-[#0F2A18]">Privacy policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
