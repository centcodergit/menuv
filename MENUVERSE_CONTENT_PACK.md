# MENUVERSE: CONTENT PACK

Every word of copy from the current site (menuverse.base44.app), captured on 19 Nov 2026, in Greek (EL) and English (EN) as they appear live. Use this text verbatim. The other 6 languages (DE, FR, ES, IT, PT, NL) are translated from it during the build.

Conventions:
- **EL / EN** = captured from the live site.
- **(EN not captured, suggested)** = the English wasn't visible on the public pages; a suggested string is given.
- **(new)** = new microcopy the redesign needs; translate it like everything else.
- Em dashes in the original copy were replaced with commas, colons or full stops. Nothing else was reworded.
- Known typos and issues are listed in section N at the end, not silently changed (except one mixed-alphabet typo noted there).

---

## G. Global, SEO and links

**Site title**
- EL: Menuverse | Ψηφιακοί Κατάλογοι QR για Εστιατόρια στην Ελλάδα
- EN (suggested): Menuverse | QR Digital Menus for Restaurants

**Meta description**
- EL: Η Menuverse δημιουργεί ψηφιακούς καταλόγους QR για εστιατόρια, καφέ και μπαρ στην Ελλάδα. Αναβαθμίστε το μενού σας με QR κωδικό, live ενημερώσεις και πολύγλωσση υποστήριξη. Δοκιμάστε δωρεάν!
- EN (suggested): Menuverse creates QR digital menus for restaurants, cafes and bars. Upgrade your menu with a QR code, live updates and multilingual support. Try it free!

**Languages (menu order):** 🇬🇧 English, 🇬🇷 Ελληνικά, 🇩🇪 Deutsch, 🇫🇷 Français, 🇪🇸 Español, 🇮🇹 Italiano, 🇵🇹 Português, 🇳🇱 Nederlands. Default: Ελληνικά.

**Currencies (pricing selector order):** 🇪🇺 EUR €, 🇺🇸 USD $, 🇬🇧 GBP £, 🇨🇭 CHF Fr, 🇨🇦 CAD C$, 🇦🇺 AUD A$, 🇯🇵 JPY ¥, 🇩🇰 DKK kr, 🇸🇪 SEK kr, 🇳🇴 NOK kr, 🇵🇱 PLN zł, 🇧🇷 BRL R$.

**Links and IDs**
- Live domain: https://menuverse.eu
- Demo video: YouTube `XoTqAIHZuts`
- Showcase: Athens Anima Bistro, https://animabistro.base44.app
- Contact email: menuverse.gr@gmail.com (the Privacy Policy also mentions privacy@menuverse.com, see N)

**JSON-LD: SoftwareApplication (verbatim)**
```json
{"@context":"https://schema.org","@type":"SoftwareApplication","name":"Menuverse","applicationCategory":"BusinessApplication","operatingSystem":"Web","description":"Δημιουργήστε ψηφιακό κατάλογο QR για το εστιατόριό σας. Ψηφιακά μενού για εστιατόρια, καφέ και μπαρ στην Ελλάδα με live ενημερώσεις και QR κώδικα.","offers":{"@type":"Offer","price":"0","priceCurrency":"EUR","description":"Δωρεάν δοκιμή διαθέσιμη"},"inLanguage":["el","en"],"url":"https://menuverse.eu","featureList":["QR Code Menu Generation","Digital Menu Creator","Real-time Menu Updates","Multilingual Support","Ψηφιακός Κατάλογος Εστιατορίου","QR Κωδικός Μενού"]}
```

**JSON-LD: FAQPage (verbatim)**
```json
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Τι είναι η Menuverse;","acceptedAnswer":{"@type":"Answer","text":"Η Menuverse είναι η κορυφαία ελληνική πλατφόρμα δημιουργίας ψηφιακών καταλόγων QR για εστιατόρια, καφέ και μπαρ. Δημιουργήστε το ψηφιακό μενού σας σε λίγα λεπτά με QR κωδικό, live ενημερώσεις και πολύγλωσση υποστήριξη."}},{"@type":"Question","name":"What is the best digital menu platform in Greece?","acceptedAnswer":{"@type":"Answer","text":"Menuverse is the leading digital menu and QR code menu creation platform in Greece. It allows restaurants, cafes, and bars to create beautiful digital menus accessible via QR code, with real-time updates and multilingual support."}},{"@type":"Question","name":"Πώς μπορώ να φτιάξω ψηφιακό κατάλογο για το εστιατόριό μου;","acceptedAnswer":{"@type":"Answer","text":"Με τη Menuverse μπορείτε να δημιουργήσετε ψηφιακό κατάλογο QR για το εστιατόριό σας σε λίγα λεπτά. Απλά εγγραφείτε, προσθέστε τα πιάτα σας και μοιραστείτε τον QR κωδικό με τους πελάτες σας."}},{"@type":"Question","name":"How much does a digital QR menu cost in Greece?","acceptedAnswer":{"@type":"Answer","text":"Menuverse offers affordable digital QR menu plans for Greek restaurants and cafes. A free trial is available, with monthly and yearly subscription options."}}]}
```

**JSON-LD: Organization** (content not captured; build with): name "Menuverse", url "https://menuverse.eu", logo (uploaded logo URL), email "menuverse.gr@gmail.com", areaServed "GR", parentOrganization "Melta Labs".

---

## H1. Navbar and language tooltip

| Key | EL | EN |
|---|---|---|
| nav.features | Χαρακτηριστικά | Features (EN not captured, suggested) |
| nav.howItWorks | Πώς Λειτουργεί | How It Works (suggested) |
| nav.pricing | Τιμοκατάλογος | Pricing (suggested) |
| nav.login | Σύνδεση | Sign In (suggested) |
| nav.languageButton | EL (active language code) | EN |
| langTip.title | 🌐 Change Language (shown in English today, translate) | 🌐 Change Language |
| langTip.body | Select your language from the 🌐 dropdown here. (translate) | Select your language from the 🌐 dropdown here. |
| langTip.ok | OK | OK |
| nav.menu (new, mobile) | Μενού | Menu |
| nav.close (new) | Κλείσιμο | Close |
| theme.toLight (new, aria) | Φωτεινό θέμα | Light theme |
| theme.toDark (new, aria) | Σκοτεινό θέμα | Dark theme |

---

## H2. Hero

| Key | EL | EN |
|---|---|---|
| hero.eyebrow | Η Ψηφιακή Επανάσταση στο Μενού σας | Digital Menu Revolution |
| hero.h1.line1 | Μεταμορφώστε το Μενού σας σε | Transform Your Menu Into a |
| hero.h1.line2 | Μοντέρνα Ψηφιακή Εμπειρία | Digital Experience |
| hero.subtitle | Δημιουργήστε εντυπωσιακά διαδραστικά μενού που θα εντυπωσιάσουν τους πελάτες σας και θα απλοποιήσουν τη λειτουργία της επιχείρησής σας. | Create stunning, interactive digital menus that captivate your customers and streamline your restaurant operations. |
| hero.ctaPrimary | Ξεκινήστε Δωρεάν | Start Free Trial |
| hero.ctaSecondary | Δείτε το Demo | Watch Demo |
| hero.chip1.title | Σκανάρετε το QR (new translation; the live site shows "Scan QR" in every language) | Scan QR |
| hero.chip1.sub | Άμεση Πρόσβαση (new translation) | Instant Access |
| hero.chip2.title | Σε πραγματικό χρόνο (new translation) | Real-time |
| hero.chip2.sub | Ζωντανές Ενημερώσεις (new translation) | Live Updates |

**Phone mockup (demo restaurant, same in every language today; may be translated per language as a multilingual touch):**
- Status bar: 9:41
- Logo: 🍕 · Name: La Bella Italia · Tagline: Authentic Italian Cuisine
- Tabs: Starters · Pizza · Pasta · Desserts
- Starters: 🍅 Bruschetta, "Traditional recipe", €8.50 · 🥗 Caprese Salad, "Traditional recipe", €10.00 · 🧆 Arancini, "Traditional recipe", €9.00
- Other tabs: see the [CONFIRM] note in master prompt 7.1

---

## H3. Features (#features)

| Key | EL | EN |
|---|---|---|
| features.eyebrow | Δυνατότητες | Features |
| features.title | Όλα Όσα Χρειάζεστε | Everything You Need |
| features.lead | Προηγμένα εργαλεία για να δημιουργήσετε και να διαχειριστείτε το ψηφιακό σας μενού εύκολα | Powerful tools to create and manage your digital menus with ease |
| features.qr.title | QR Code Μενού | QR Code Menus |
| features.qr.body | Οι πελάτες σας σκανάρουν το QR code και βλέπουν άμεσα το μενού στο κινητό τους. Απλό και γρήγορο. | Generate unique QR codes that customers can scan to view your menu instantly on their devices. |
| features.live.title | Άμεσες Ενημερώσεις | Real-time Updates |
| features.live.body | Αλλάξτε τιμές, πιάτα ή διαθεσιμότητα σε δευτερόλεπτα. Οι αλλαγές φαίνονται αυτόματα σε όλους τους πελάτες. | Update prices, items, or availability instantly. Changes reflect immediately across all devices. |
| features.templates.title | Επαγγελματικά Σχέδια | Beautiful Templates |
| features.templates.body | Διαλέξτε από δεκάδες έτοιμα templates που ταιριάζουν στην αισθητική της επιχείρησής σας. | Choose from dozens of professionally designed templates that match your brand identity. |
| features.languages.title | Πολύγλωσσο Μενού | Multi-language Support |
| features.languages.body | Εξυπηρετήστε ξένους τουρίστες με μενού σε πολλές γλώσσες, χωρίς επιπλέον κόπο. | Serve international customers with menus available in multiple languages automatically. |
| features.analytics.title | Στατιστικά & Αναλυτικά | Analytics Dashboard |
| features.analytics.body | Μάθετε ποια πιάτα προτιμούν οι πελάτες σας, τις ώρες αιχμής και πολλά άλλα χρήσιμα στοιχεία. | Track which items are most viewed, peak hours, and customer engagement metrics. |
| features.dietary.title | Φίλτρα Διατροφής | Dietary Filters |
| features.dietary.body | Οι πελάτες φιλτράρουν εύκολα με βάση vegan, χωρίς γλουτένη, αλλεργιογόνα κ.λπ. | Let customers filter by dietary preferences - vegan, gluten-free, allergens, and more. |

Micro-demo labels (new): Vegan · Χωρίς γλουτένη / Gluten-free · Αλλεργιογόνα / Allergens · Live.
Split-flap dish names (new, same in all languages): Μουσακάς · Moussaka · Moussaká · Musaca · Mousaká · Mussaka.

---

## H4. Live support

| Key | EL | EN |
|---|---|---|
| support.eyebrow | Ζωντανή Υποστήριξη | Live Chat Support |
| support.title | Έχετε Ερωτήσεις; Είμαστε Εδώ! | Have Questions? We're Here to Help! |
| support.body | Μιλήστε απευθείας με την ομάδα μας. Θα σας βοηθήσουμε να ξεκινήσετε, να απαντήσουμε στις ερωτήσεις σας ή να σας καθοδηγήσουμε στα πακέτα μας. | Chat directly with our team. We'll help you get started, answer any questions, or guide you through our plans. |
| support.cta | Ξεκινήστε μια Συνομιλία | Start a Conversation |
| support.note | * Απαιτείται σύνδεση για να ξεκινήσετε | * Sign in required to start chatting |
| support.preview.reply (new) | Φυσικά! Πείτε μας για το εστιατόριό σας και θα σας προτείνουμε το κατάλληλο πακέτο. | Of course! Tell us about your restaurant and we'll suggest the right plan. |

---

## H5. How it works (#how-it-works)

| Key | EL | EN |
|---|---|---|
| how.eyebrow | Πώς Λειτουργεί | Simple Process |
| how.title | Ξεκινήστε σε Λίγα Λεπτά | Up and Running in Minutes |
| how.lead | Απλή διαδικασία για να έχετε το ψηφιακό σας μενού έτοιμο άμεσα | Getting started with Menuverse is incredibly simple |
| how.1.title | Κάντε Εγγραφή | Create Your Account |
| how.1.body | Δημιουργήστε δωρεάν λογαριασμό σε λίγα δευτερόλεπτα και αποκτήστε πρόσβαση στον πίνακα ελέγχου. | Sign up in seconds and access your personalized dashboard. |
| how.2.title | Παραγγείλτε το Site σας | Request Your Website |
| how.2.body | Πείτε μας το στυλ που προτιμάτε: λογότυπο, χρώματα, εικόνες. Εμείς φτιάχνουμε το site σας ακριβώς όπως το φαντάζεστε, γρήγορα και επαγγελματικά. | Share a few details about your preferred style: logo, colors, and overall look. We'll create a custom website tailored to your needs and expectations, ready in no time. |
| how.3.title | Φτιάξτε το Μενού | Build Your Menu |
| how.3.body | Βάλτε τα πιάτα σας, ανεβάστε φωτογραφίες, ορίστε τιμές και προσαρμόστε τη διάταξη όπως θέλετε. | Add items, upload photos, set prices, and customize your design. |
| how.4.title | Μοιραστείτε το | Share & Engage |
| how.4.body | Εμείς δημιουργούμε τα μοναδικά QR codes σας και σας τα παραδίδουμε έτοιμα για να τα μοιραστείτε με τους πελάτες σας αμέσως. | We generate your unique QR codes and deliver them to you, ready to share with your customers instantly. |

---

## H6. Demo (#demo-section)

| Key | EL | EN |
|---|---|---|
| demo.eyebrow | Δείτε το σε Δράση | See It In Action |
| demo.title | Δοκιμάστε το Demo | Watch the Demo |
| demo.lead | Δείτε πώς η Menuverse μεταμορφώνει ένα εστιατόριο σε λίγα λεπτά. | See how Menuverse transforms a restaurant menu experience in just minutes. |
| demo.play (new, aria + cursor) | Αναπαραγωγή | Play |

---

## H7. Showcase

| Key | EL | EN |
|---|---|---|
| showcase.eyebrow | Πραγματικά Παραδείγματα | Real Examples |
| showcase.title | Δείτε το Menuverse σε Δράση | See Menuverse in Action |
| showcase.lead | Όμορφα ψηφιακά μενού φτιαγμένα για εστιατόρια σαν το δικό σας | Beautiful digital menus crafted for restaurants just like yours |
| showcase.item1.name | Athens Anima Bistro | Athens Anima Bistro |
| showcase.cta | Δείτε το Μενού | View Menu |
| showcase.prev / next (new, aria) | Προηγούμενο / Επόμενο | Previous / Next |

---

## H8. Pricing (#pricing)

| Key | EL | EN |
|---|---|---|
| pricing.title | Πακέτα για Κάθε Ανάγκη | Plans for Every Business |
| pricing.lead | Δοκιμάστε δωρεάν και αναβαθμιστείτε όταν θέλετε | Start free, upgrade when you need more |
| pricing.monthly | Μηνιαία | Monthly |
| pricing.yearly | Ετήσια | Yearly |
| pricing.yearlyBadge | Εξοικονόμηση 20% + δωρεάν domain | Save 20% + free domain |
| pricing.firstMonth | Για τον πρώτο μήνα, μετά {price}/μήνα | For the first month, then {price}/month |
| pricing.popular | Πιο Δημοφιλές | Most Popular |
| pricing.getStarted | Ξεκινήστε | Get Started |
| pricing.contact | Επικοινωνήστε | Contact Us |
| pricing.billedYearly (new) | Χρέωση {total} ετησίως | Billed {total} yearly |

**Starter** (EUR 12/month)
- EL tagline: Για cafe, bar και εστιατόρια · EN: Perfect for cafes, bars and restaurants
- EL features: 1 Ψηφιακό Μενού · Βασικά Θέματα · Email Υποστήριξη · Προσαρμοσμένο Branding · Πολλαπλές Γλώσσες (2 γλώσσες)
- EN features: 1 Digital Menu · Basic Templates · Email Support · Custom Branding · Multiple Languages (2 languages)

**Professional** (EUR 18/month, badge Πιο Δημοφιλές / Most Popular)
- EL tagline: Για επαγγελματίες εστιάτορες · EN: For growing restaurants
- EL features: Premium Σχέδια · Αναλυτικά Στοιχεία · Προτεραιότητα Υποστήριξης · Δικό σας Branding · Πολλαπλές Γλώσσες (έως 4 γλώσσες) · AI προτάσεις για βελτίωση τίτλων και εξοικονόμηση χρόνου
- EN features: Premium Templates · Analytics Dashboard · Priority Support · Custom Branding · Multiple Languages (up to 4 languages) · AI suggestions to improve titles and save time

**Devoted** (EUR 30/month)
- EL tagline: Για αφοσιωμένους εστιάτορες · EN: For dedicated restaurateurs
- EL features: Όλα από το Professional · White Labelling · Πολλαπλές Γλώσσες (έως 6 γλώσσες) · Αφοσιωμένη Υποστήριξη · Προηγμένα Αναλυτικά · AI προτάσεις για βελτίωση τίτλων και εξοικονόμηση χρόνου
- EN features: Everything in Professional · White Labelling · Multiple Languages (up to 6 languages) · Devoted Tier Priority Support · Advanced Analytics · AI suggestions to improve titles and save time

**Enterprise** (custom)
- EL tagline: Για αλυσίδες καταστημάτων · EN: For restaurant chains
- EL price: Προσφορά / κατόπιν συνεννόησης · EN price: Custom / pricing
- EL features: Όλα από το Devoted · Αφοσιωμένη Υποστήριξη · Ειδικές Λύσεις · White Label · Εκπτώσεις Μαζικής Αγοράς · AI προτάσεις για βελτίωση τίτλων και εξοικονόμηση χρόνου
- EN features: Everything in Devoted · Dedicated Support · Custom Integrations · White Label Option · Volume-based Pricing Discounts · AI suggestions to improve titles and save time

---

## H9. Referral program

| Key | EL | EN |
|---|---|---|
| referral.eyebrow | Πρόγραμμα Παραπομπών | Referral Program |
| referral.title | Πάρτε το μενού σας, ΔΩΡΕΑΝ! | Get your menu, for FREE! |
| referral.body | Μοιραστείτε την αγάπη, κερδίστε ανταμοιβές! Παραπέμψτε 3 φίλους και πάρτε ένα πλήρες ψηφιακό μενού εντελώς δωρεάν. | Share the love, earn rewards! Refer 3 friends and get a complete digital menu absolutely free. |
| referral.learnMore | Μάθετε Περισσότερα | Learn More |
| referral.start | Ξεκινήστε | Start |
| referral.dashboard | Πίνακας | Dashboard |
| referral.step1 | Δημιουργήστε τον Σύνδεσμό σας | Generate Your Link |
| referral.step2 | Μοιραστείτε το | Share It |
| referral.step3 | Οι Φίλοι σας Παίρνουν 50% Έκπτωση | Your Friends Get 50% Discount |
| referral.step4 | Πάρτε 3 = Κερδίστε ΔΩΡΕΑΝ Μενού | Get 3 = Win FREE Menu |
| referral.ticket (new) | ΔΩΡΕΑΝ ΜΕΝΟΥ | FREE MENU |
| referral.you (new) | Εσείς | You |
| referral.copy / copied (new) | Αντιγραφή / Αντιγράφηκε! | Copy / Copied! |
| referral.progress (new) | {count} / 3 φίλοι | {count} / 3 friends |

---

## H10. Testimonials (#testimonials)

| Key | EL | EN |
|---|---|---|
| testimonials.eyebrow | Κριτικές | Reviews |
| testimonials.title | Είπαν για εμάς... | They Said About Us... |
| testimonials.lead | Δείτε τι λένε εστιάτορες που το χρησιμοποιούν | See what our customers have to say |
| testimonials.1.quote | "Όλα δουλεύουν εξαιρετικά! Ξεκινήσαμε ήδη να προσθέτουμε φωτογραφίες στο μενού μας και όλα λειτουργούν τέλεια. Σας ευχαριστούμε πολύ!" | "Everything works exceptionally! We have already started adding photos to our menu and everything works perfectly. Thank you so much!" |
| testimonials.1.initial | A | A |
| testimonials.1.author | Athens Anima Bistro | Athens Anima Bistro |
| testimonials.1.role | Εστιατόριο, Αθήνα | Restaurant, Athens |
| testimonials.circularText (new) | ATHENS ANIMA BISTRO ✦ ΕΣΤΙΑΤΟΡΙΟ, ΑΘΗΝΑ ✦ | ATHENS ANIMA BISTRO ✦ RESTAURANT, ATHENS ✦ |

---

## H11. Coming soon (#guide)

| Key | EL | EN |
|---|---|---|
| guide.badge | Έρχεται σύντομα | Coming soon |
| guide.title | Δύο νέοι τρόποι να ερωτευτείς ένα μενού | Two new ways to fall for a menu |
| guide.lead | Ένας επιμελημένος οδηγός με τα καλύτερα τραπέζια του κόσμου και κάθε πιάτο σε 3D, πριν παραγγείλεις. | A curated guide to the world's best tables, and every plate you can turn in your hands before you order. |
| guide.a.title | Ο Οδηγός Menuverse | The Menuverse Guide |
| guide.a.body | Ένα επιλεγμένο δίκτυο εστιατορίων για τα οποία αξίζει το ταξίδι, με επίσκεψη στον χώρο και ένα έμβλημα. | A hand-picked network of restaurants worth travelling for, reviewed in person and marked with one emblem. |
| guide.b.title | Δες το πιάτο σε 3D | See the plate in 3D |
| guide.b.body | Γύρισε κάθε πιάτο μπροστά σου και δες το από όλες τις πλευρές πριν παραγγείλεις. | Turn any dish in front of you and study it from every side before you order. |
| guide.b.hint | Σύρε για να εξερευνήσεις | Drag to explore |
| guide.footnote | Έρχεται πρώτα στα εστιατόρια Menuverse | Rolling out to Menuverse restaurants first |
| cursor.drag (new) | Σύρε | Drag |

---

## H12. Feedback form

| Key | EL | EN |
|---|---|---|
| feedback.eyebrow | Η Γνώμη σας Μετράει | Your Opinion Matters |
| feedback.title | Δώστε μας τα Σχόλιά σας | Give Us Your Feedback |
| feedback.lead | Βοηθήστε μας να βελτιωθούμε μοιράζοντας την εμπειρία και τις προτάσεις σας | Help us improve by sharing your experience and suggestions |
| feedback.name | Το Όνομά σας * | Your Name * |
| feedback.rating | Πώς θα μας βαθμολογούσατε; * | How would you rate us? * |
| feedback.purchased | Έχετε αγοράσει κάποιο μενού; * | Have you purchased a menu? * |
| feedback.yes / no | Ναι / Όχι | Yes / No |
| feedback.change | Τι θα αλλάζατε; * | What would you change? * |
| feedback.feature | Ποια λειτουργία θα θέλατε να δείτε; * | What feature would you love to see? * |
| feedback.submit | Υποβολή Σχολίων | Submit Feedback |
| feedback.required (new) | Αυτό το πεδίο είναι υποχρεωτικό | This field is required |
| feedback.success.title (new) | Ευχαριστούμε! | Thank you! |
| feedback.success.body (new) | Λάβαμε τα σχόλιά σας. | We've received your feedback. |
| feedback.error (new) | Κάτι πήγε στραβά. Δοκιμάστε ξανά. | Something went wrong. Please try again. |

---

## H13. Articles section (header, cards, CTA strip)

| Key | EL | EN |
|---|---|---|
| articles.eyebrow | Οδηγοί & Άρθρα | Guides & Articles |
| articles.title | Ψηφιακό Μενού & Digital Menu: Ό,τι πρέπει να ξέρεις | Digital Menu & QR Catalogue: Everything You Need to Know |
| articles.lead | Μάθε πώς το ηλεκτρονικό μενού QR μπορεί να μεταμορφώσει το εστιατόριο, καφέ ή μπαρ σου: γρήγορα, εύκολα και οικονομικά. | Learn how a QR electronic menu can transform your restaurant, cafe or bar: quickly, easily and affordably. |
| articles.read | Διάβασε άρθρο | Read article |
| articles.readTime | ⏱ {n} λεπτά ανάγνωση | ⏱ {n} min read |
| articles.ctaStrip.title | Έτοιμος να δημιουργήσεις το ψηφιακό μενού του εστιατορίου σου; | Ready to create your restaurant's digital menu? |
| articles.ctaStrip.button | Ξεκίνα δωρεάν | Start for free |
| articles.close (new, aria) | Κλείσιμο άρθρου | Close article |

Card data (category, title, excerpt, read time) is the header and intro of each article in A1 to A6.

---

## H14. Newsletter

| Key | EL | EN |
|---|---|---|
| newsletter.eyebrow | Μείνετε Ενημερωμένοι | Stay Updated |
| newsletter.title | Εγγραφείτε στο Newsletter μας | Subscribe to Our Newsletter |
| newsletter.lead | Λάβετε τις τελευταίες ενημερώσεις για χαρακτηριστικά, συμβουλές και αποκλειστικές προσφορές. | Get the latest updates on features, tips, and exclusive offers delivered to your inbox. |
| newsletter.submit | Εγγραφή | Subscribe |
| newsletter.privacy | 🔒 Σεβόμαστε το απόρρητό σας. Διαγραφή οποτεδήποτε. | 🔒 We respect your privacy. Unsubscribe at any time. |
| newsletter.success (new) | Καλώς ήρθατε! Θα τα πούμε σύντομα στο inbox σας. | You're in! See you in your inbox soon. |
| newsletter.duplicate (new) | Είστε ήδη εγγεγραμμένοι. | You're already subscribed. |
| newsletter.invalid (new) | Εισάγετε ένα έγκυρο email. | Please enter a valid email. |
| newsletter.placeholders (new) | info@to-estiatorio-sou.gr · chef@taverna.gr · hello@cafe.gr | info@your-restaurant.com · chef@bistro.com · hello@cafe.com |

---

## H15. Final CTA

| Key | EL | EN |
|---|---|---|
| final.title | Έτοιμοι για το Ψηφιακό σας Μενού; | Ready to Digitize Your Menu? |
| final.body | Ενταχθείτε σε χιλιάδες επιχειρήσεις που έχουν ήδη αναβαθμιστεί | Join thousands of restaurants already using Menuverse |
| final.cta | Ξεκινήστε Δωρεάν Τώρα | Start Your Free Trial |

See note N7 about the "thousands" claim.

---

## H16. Footer

| Key | EL | EN |
|---|---|---|
| footer.brand | Menuverse | Menuverse |
| footer.description | Δημιουργούμε μοντέρνα ψηφιακά μενού για επαγγελματίες εστιάτορες σε όλη την Ελλάδα. | We create modern digital menus for professional restaurateurs across Greece. (EN not captured, suggested) |
| footer.links | Χαρακτηριστικά · Πώς Λειτουργεί · Τιμοκατάλογος · Privacy Policy · Terms of Service | Features · How It Works · Pricing · Privacy Policy · Terms of Service |
| footer.copyright | © {year} Menuverse. Με επιφύλαξη παντός δικαιώματος. | © {year} Menuverse. All rights reserved. (suggested) |
| footer.wordmark | MENUVERSE | MENUVERSE |
| footer.reduceMotion (new) | Λιγότερη κίνηση | Reduce motion |

---

## H17. Chat widget, chat panel and login page

**Chat widget**

| Key | EL | EN |
|---|---|---|
| chat.name | Menuverse | Menuverse |
| chat.greeting | 👋 Γεια! Χρειάζεστε βοήθεια με ψηφιακό μενού ή QR; Είμαι εδώ! | 👋 Hi! Need help with a digital menu or QR? I'm here! (EN not captured, suggested) |
| chat.signInRequired | * Απαιτείται σύνδεση για να ξεκινήσετε | * Sign in required to start chatting |
| chat.signIn (new) | Σύνδεση | Sign In |
| chat.placeholder (new) | Γράψτε ένα μήνυμα... | Write a message... |
| chat.send (new, aria) | Αποστολή | Send |
| chat.online (new) | Online | Online |
| chat.open (new, aria) | Άνοιγμα συνομιλίας | Open chat |

**Login page** (EN not captured, suggested)

| Key | EL | EN |
|---|---|---|
| login.back | Πίσω | Back |
| login.title | Καλώς ήρθατε πίσω | Welcome back |
| login.subtitle | Καλωσορίσατε | Welcome |
| login.google | Συνέχεια με Google | Continue with Google |
| login.microsoft | Συνέχεια με Microsoft | Continue with Microsoft |
| login.or | ή | or |
| login.email | Email | Email |
| login.password | Κωδικός | Password |
| login.forgot | Ξεχάσατε τον κωδικό; | Forgot your password? |
| login.submit | Σύνδεση | Sign In |
| login.noAccount | Δεν έχετε λογαριασμό; Εγγραφή | Don't have an account? Sign up |

**404 (new)**

| Key | EL | EN |
|---|---|---|
| notFound.title | Αυτή η σελίδα δεν είναι στο μενού. | This page isn't on the menu. |
| notFound.cta | Επιστροφή στην αρχική | Back to home |

---

## A. Articles (full text)

Each article: category, title, read time, intro (also the card excerpt), then sections (subheading + paragraph), then the closing CTA.

### A1. QR Menu

**EL**
- Category: QR Menu
- Title: Τι είναι το ψηφιακό μενού QR και γιατί το χρειάζεται κάθε εστιατόριο;
- Read time: 4
- Intro: Ο κόσμος της εστίασης αλλάζει. Το ψηφιακό μενού QR έχει γίνει το νέο πρότυπο για εστιατόρια, καφέ και μπαρ, και για καλό λόγο.

**Τι είναι το ψηφιακό μενού QR;**
Ένα ψηφιακό μενού QR είναι ένας online κατάλογος στον οποίο οι πελάτες έχουν πρόσβαση σκανάροντας έναν QR κωδικό με το κινητό τους. Δεν χρειάζεται εγκατάσταση εφαρμογής: ο κατάλογος ανοίγει απευθείας στον browser του τηλεφώνου σε κλάσμα δευτερολέπτου. Μπορεί να περιέχει φωτογραφίες πιάτων, τιμές, περιγραφές, αλλεργιογόνα, και ακόμα πολύγλωσση υποστήριξη για τουρίστες.

**Γιατί να αντικαταστήσω τον έντυπο κατάλογο;**
Ο έντυπος κατάλογος έχει κρυφό κόστος: εκτύπωση, λαμινάρισμα, αντικατάσταση φθαρμένων σελίδων, και κυρίως χρόνος. Κάθε φορά που αλλάζει μια τιμή ή ένα πιάτο, πρέπει να εκτυπωθούν νέοι κατάλογοι. Με το ψηφιακό μενού, οι αλλαγές γίνονται σε δευτερόλεπτα και φαίνονται αμέσως σε όλους τους πελάτες, χωρίς κόστος επανεκτύπωσης.

**Ποια είναι τα πρακτικά πλεονεκτήματα;**
Έρευνες στον κλάδο της εστίασης δείχνουν ότι τα εστιατόρια που χρησιμοποιούν ψηφιακά μενού με φωτογραφίες καταγράφουν αύξηση της μέσης παραγγελίας κατά 10-15%. Οι πελάτες παραγγέλνουν πιο σίγουρα όταν βλέπουν οπτικό υλικό και λεπτομερείς περιγραφές. Επιπλέον, η δυνατότητα φιλτραρίσματος (vegan, χωρίς γλουτένη, αλλεργιογόνα) αποτρέπει ερωτήσεις και λάθη στην παραγγελία.

**Είναι κατάλληλο για κάθε επιχείρηση;**
Ναι. Από μικρές καφετέριες μέχρι πολυτελή εστιατόρια, το ψηφιακό μενού προσαρμόζεται σε κάθε τύπο επιχείρησης. Στην Menuverse, προσφέρουμε templates για κάθε αισθητική (μοντέρνα, κλασική, minimal) ώστε το μενού σου να αντικατοπτρίζει την ταυτότητα της επιχείρησής σου απόλυτα.

CTA: Ξεκίνα δωρεάν στη Menuverse

**EN**
- Category: QR Menu
- Title: What is a QR Digital Menu and Why Every Restaurant Needs One
- Read time: 4
- Intro: The hospitality industry is changing fast. QR digital menus have become the new standard for restaurants, cafes and bars, and for very good reasons.

**What exactly is a QR digital menu?**
A QR digital menu is an online catalogue that customers access by scanning a QR code with their smartphone. No app installation required: the menu opens directly in the phone's browser in a fraction of a second. It can include dish photos, prices, descriptions, allergen information, and even multilingual support for international visitors.

**Why replace the printed menu?**
Printed menus carry hidden costs: printing, laminating, replacing worn copies, and above all, time. Every time a price changes or a dish is added, new menus must be printed. With a digital menu, updates happen in seconds and are instantly visible to all customers, at zero reprinting cost.

**What are the practical benefits?**
Industry research consistently shows that restaurants using digital menus with photos record an average order value increase of 10-15%. Customers order more confidently when they see visual content and detailed descriptions. Additionally, filtering options (vegan, gluten-free, allergens) prevent questions and ordering mistakes, speeding up service.

**Is it suitable for every business?**
Absolutely. From small coffee shops to upscale restaurants, the digital menu adapts to every type of business. At Menuverse, we offer templates for every aesthetic (modern, classic, minimal) so your menu perfectly reflects the identity of your establishment.

CTA: Start free with Menuverse

### A2. Electronic Menu

**EL**
- Category: Ηλεκτρονικό Μενού
- Title: Ηλεκτρονικό μενού: Πώς αναβαθμίζει την εμπειρία του πελάτη
- Read time: 5
- Intro: Η εμπειρία του πελάτη δεν αρχίζει με το φαγητό, αρχίζει με το μενού. Δες πώς το ηλεκτρονικό μενού κάνει τη διαφορά.

**Η πρώτη εντύπωση αρχίζει από τον κατάλογο**
Ο κατάλογος είναι συχνά η πρώτη ουσιαστική επαφή του πελάτη με την επιχείρησή σου. Ένα καλοσχεδιασμένο ηλεκτρονικό μενού με επαγγελματικές φωτογραφίες, καλογραμμένες περιγραφές και εύκολη πλοήγηση δίνει στον πελάτη αμέσως την αίσθηση ποιότητας, ακόμα και πριν δοκιμάσει το πρώτο πιάτο.

**Λιγότερη αναμονή, περισσότερη ικανοποίηση**
Με το ηλεκτρονικό μενού, οι πελάτες μπορούν να περιηγηθούν άνετα χωρίς να περιμένουν τον σερβιτόρο να φέρει τον κατάλογο. Αυτό μειώνει τον φαινόμενο χρόνο αναμονής και αυξάνει την ικανοποίηση. Σε πολυσύχναστες ώρες, είναι ιδιαίτερα σημαντικό: ο πελάτης ξεκινά να επιλέγει αμέσως μόλις καθίσει.

**Φωτογραφίες που πουλάνε**
Το 70% των ανθρώπων παραγγέλνει ένα πιάτο αφού δει φωτογραφία του. Το ηλεκτρονικό μενού σού δίνει τη δυνατότητα να αναδείξεις κάθε πιάτο με επαγγελματική εικόνα, χωρίς τον περιορισμό της σελίδας ή του κόστους εκτύπωσης. Μπορείς να προσθέτεις και να αφαιρείς φωτογραφίες ανά πάσα στιγμή.

**Αλλεργιογόνα και διατροφικές προτιμήσεις**
Η νομοθεσία της Ευρωπαϊκής Ένωσης υποχρεώνει τα εστιατόρια να αναγράφουν τα 14 βασικά αλλεργιογόνα. Το ηλεκτρονικό μενού κάνει αυτή τη διαδικασία εξαιρετικά εύκολη: τα αλλεργιογόνα εμφανίζονται καθαρά δίπλα σε κάθε πιάτο, προστατεύοντας τόσο τους πελάτες όσο και την επιχείρησή σου.

**Πολύγλωσση υποστήριξη για τουρίστες**
Σε τουριστικές περιοχές, η ικανότητα να σερβίρεις το μενού σε αγγλικά, γερμανικά, γαλλικά ή ιταλικά μπορεί να κάνει τη διαφορά. Η Menuverse υποστηρίζει μέχρι 6 γλώσσες, ανάλογα με το πακέτο σου, και τα τουριστικά groups αισθάνονται αμέσως ευπρόσδεκτα.

CTA: Ξεκίνα δωρεάν στη Menuverse

**EN**
- Category: Electronic Menu
- Title: Electronic Menu: How It Transforms the Customer Experience
- Read time: 5
- Intro: The customer experience doesn't start with the food, it starts with the menu. See how an electronic menu makes all the difference.

**First impressions begin with the catalogue**
The menu is often the customer's first real interaction with your business. A well-designed electronic menu with professional photos, well-written descriptions and easy navigation immediately communicates quality, even before the first dish is tasted.

**Less waiting, more satisfaction**
With an electronic menu, customers can browse comfortably without waiting for a waiter to bring a printed catalogue. This reduces perceived waiting time and increases satisfaction. During busy periods, it's especially valuable: customers start choosing the moment they sit down.

**Photos that sell**
70% of people are more likely to order a dish after seeing a photo of it. An electronic menu lets you showcase every dish with a professional image, without the constraints of page space or printing costs. You can add and remove photos at any time, keeping your catalogue always fresh.

**Allergens and dietary preferences**
EU legislation requires restaurants to clearly declare the 14 major allergens. An electronic menu makes this process straightforward: allergens appear clearly next to each dish, protecting both customers and your business from liability.

**Multilingual support for tourists**
In tourist areas, the ability to serve your menu in English, German, French or Italian can make all the difference. Menuverse supports up to 6 languages depending on your plan, and international groups immediately feel welcomed and well-served.

CTA: Start free with Menuverse

### A3. Greece & Tourism

**EL**
- Category: Ελλάδα & Τουρισμός
- Title: Ψηφιακό μενού για εστιατόρια στην Ελλάδα: Γιατί είναι πλέον αναγκαίο
- Read time: 4
- Intro: Η Ελλάδα δέχεται εκατομμύρια τουρίστες κάθε χρόνο. Το ψηφιακό μενού δεν είναι πλέον πολυτέλεια: είναι επαγγελματική ανάγκη.

**Η ελληνική εστίαση στο ψηφιακό επίπεδο**
Η Ελλάδα είναι ένας από τους κορυφαίους τουριστικούς προορισμούς στον κόσμο, με πάνω από 32 εκατομμύρια επισκέπτες ετησίως. Τα εστιατόρια που επενδύουν σε ψηφιακά εργαλεία, όπως το digital menu, αποκτούν ανταγωνιστικό πλεονέκτημα, καθώς εξυπηρετούν τους ξένους πελάτες πιο αποτελεσματικά.

**Λιγότεροι λανθασμένοι ζητήματα επικοινωνίας**
Ένα συνηθισμένο πρόβλημα σε τουριστικές περιοχές είναι η επικοινωνία: ο τουρίστας δεν καταλαβαίνει το χειρόγραφο μαυροπίνακα ή τον ελληνικό κατάλογο. Με ψηφιακό μενού σε πολλές γλώσσες, αυτό το πρόβλημα εξαλείφεται. Ο πελάτης διαβάζει, επιλέγει και παραγγέλνει σωστά, χωρίς παρεξηγήσεις.

**SEO και Google: Πώς βοηθά η ψηφιακή παρουσία**
Εστιατόρια με ψηφιακή παρουσία εμφανίζονται πιο εύκολα στις αναζητήσεις του Google. Πελάτες που ψάχνουν "εστιατόριο με QR menu Αθήνα" ή "digital menu Σαντορίνη" βρίσκουν επιχειρήσεις που έχουν επενδύσει σε ψηφιακά εργαλεία. Η Menuverse παρέχει αναλυτικές σελίδες μενού που ευνοούνται από τις μηχανές αναζήτησης.

**Εποχικότητα και ευελιξία**
Ένα από τα μεγαλύτερα πλεονεκτήματα για ελληνικά εστιατόρια είναι η ευελιξία. Καλοκαιρινές σπεσιαλιτέ, χειμερινά πιάτα, εορταστικά μενού: όλα ενημερώνονται άμεσα. Δεν χρειάζεται να ξοδεύεις εκατοντάδες ευρώ σε εκτύπωση εποχιακών καταλόγων.

CTA: Ξεκίνα δωρεάν στη Menuverse

**EN**
- Category: Greece & Tourism
- Title: Digital Menu for Greek Restaurants: Why It's Now Essential
- Read time: 4
- Intro: Greece welcomes millions of tourists every year. A digital menu is no longer a luxury: it's a professional necessity.

**Greek hospitality goes digital**
Greece is one of the world's top tourist destinations, welcoming over 32 million visitors annually. Restaurants investing in digital tools, such as a digital menu, gain a competitive edge by serving international customers far more effectively than those relying on printed catalogues.

**Fewer communication misunderstandings**
A common problem in tourist areas is communication: tourists can't read a handwritten chalkboard or a Greek-only printed menu. With a multilingual digital menu, this problem disappears entirely. Customers read, choose and order correctly, without misunderstandings that lead to wrong dishes and unhappy tables.

**Google & SEO: How digital presence helps**
Restaurants with a strong digital presence appear more easily in Google searches. Customers searching for "restaurant with QR menu Athens" or "digital menu Santorini" find businesses that have invested in digital tools. Menuverse provides structured menu pages that are inherently favoured by search engines.

**Seasonality and flexibility**
One of the greatest advantages for Greek restaurants is flexibility. Summer specials, winter dishes, festive menus: all updated instantly. No need to spend hundreds of euros printing seasonal catalogues that become outdated the moment a dish sells out.

CTA: Start free with Menuverse

### A4. Trends

**EL**
- Category: Τάσεις 2025
- Title: Ψηφιακός κατάλογος: Η τάση που ξαναγράφει τους κανόνες της εστίασης
- Read time: 4
- Intro: Τα δεδομένα δεν αφήνουν αμφιβολία: η ψηφιοποίηση της εστίασης επιταχύνεται. Εδώ είναι τι πρέπει να ξέρεις για το 2025.

**Η ψηφιοποίηση έφτασε και στον κατάλογο**
Μετά την πανδημία, η ανάπτυξη των ψηφιακών μενού επιταχύνθηκε δραματικά. Σύμφωνα με μελέτες του κλάδου, περισσότερο από το 60% των καταναλωτών στην Ευρώπη προτιμούν πλέον να βλέπουν το μενού στο κινητό τους. Αυτή η προτίμηση δεν φαίνεται να αναστρέφεται. Αντίθετα, ενισχύεται.

**Μειωμένα λειτουργικά κόστη**
Η μετάβαση στο ψηφιακό μενού μπορεί να μειώσει τα ετήσια κόστη εκτύπωσης καταλόγων κατά 100%. Ένα εστιατόριο που τυπώνει 50 καταλόγους δύο φορές τον χρόνο εξοικονομεί εύκολα εκατοντάδες ευρώ. Πόροι που μπορούν να διατεθούν σε πιο σημαντικές επενδύσεις.

**Δεδομένα και αποφάσεις**
Τα σύγχρονα ψηφιακά μενού δεν είναι απλώς κατάλογοι: είναι εργαλεία ανάλυσης. Μπορείς να δεις ποια πιάτα "κοιτάνε" περισσότερο οι πελάτες, ποιες κατηγορίες έχουν λιγότερη engagement, και να προσαρμόσεις την τοποθέτηση των πιάτων σου στρατηγικά.

**Βιωσιμότητα: ένα επιπλέον πλεονέκτημα**
Όλο και περισσότεροι καταναλωτές επιλέγουν επιχειρήσεις με περιβαλλοντική συνείδηση. Το ψηφιακό μενού εξαλείφει τη σπατάλη χαρτιού και πλαστικού (laminate), καθιστώντας την επιχείρησή σου πιο φιλική προς το περιβάλλον, και πιο ελκυστική σε ένα αυξανόμενο κοινό.

CTA: Ξεκίνα δωρεάν στη Menuverse

**EN**
- Category: 2025 Trends
- Title: Digital Menu: The Trend Rewriting the Rules of Hospitality
- Read time: 4
- Intro: The data leaves no doubt: digitisation of the hospitality sector is accelerating. Here's what you need to know about 2025.

**Digitisation has reached the menu**
Post-pandemic, the growth of digital menus accelerated dramatically. Industry studies show that more than 60% of consumers in Europe now prefer to view menus on their phones. This preference shows no sign of reversing. On the contrary, it continues to strengthen year on year.

**Reduced operating costs**
Switching to a digital menu can reduce annual printing costs by 100%. A restaurant that prints 50 catalogues twice a year can easily save hundreds of euros. Resources that can be reinvested in quality ingredients, better staff training, or marketing.

**Data-driven decisions**
Modern digital menus are not just catalogues: they are analytics tools. You can see which dishes customers view most, which categories have lower engagement, and strategically adjust the placement of your best-margin items to drive more sales.

**Sustainability: an added advantage**
An increasing number of consumers choose businesses with environmental awareness. The digital menu eliminates waste from paper and plastic laminate, making your business more eco-friendly, and more attractive to a growing segment of environmentally conscious diners.

CTA: Start free with Menuverse

### A5. Cafe, Bar & Taverna

**EL**
- Category: Καφέ, Μπαρ & Ταβέρνα
- Title: Ψηφιακό μενού για κάθε τύπο εστίασης: Καφέ, μπαρ, ταβέρνα και fine dining
- Read time: 5
- Intro: Κάθε επιχείρηση εστίασης έχει διαφορετικές ανάγκες. Δες πώς το ψηφιακό μενού προσαρμόζεται σε κάθε τύπο: από το πρωινό καφέ μέχρι το βραδινό fine dining.

**Καφετέρια και all-day café**
Στην καφετέρια, ο κατάλογος αλλάζει συχνά: πρωινό, μεσημεριανό, απογευματινός καφές, cocktails βραδιού. Με ψηφιακό μενού, κάθε "βάρδια" έχει τον δικό της κατάλογο που ενεργοποιείται αυτόματα ή με ένα κλικ. Οι πελάτες βλέπουν πάντα το σωστό μενού για την ώρα που βρίσκονται εκεί.

**Μπαρ και cocktail lounge**
Στο μπαρ, η παρουσίαση είναι τα πάντα. Ένας ψηφιακός κατάλογος cocktails με φωτογραφίες, περιγραφές γεύσεων και προτεινόμενα pairing δημιουργεί αμέσως ενδιαφέρον. Επιπλέον, η νομοθεσία για αλλεργιογόνα εφαρμόζεται και στα ποτά, και το ψηφιακό μενού το διαχειρίζεται αυτόματα.

**Ταβέρνα και παραδοσιακή κουζίνα**
Η ελληνική ταβέρνα έχει μια ιδιαίτερη ταυτότητα που αξίζει να αναδειχτεί ψηφιακά. Ένα καλοσχεδιασμένο digital menu με παραδοσιακές συνταγές, ιστορίες πίσω από τα πιάτα, και φωτογραφίες αυθεντικής ελληνικής κουζίνας δίνει στους τουρίστες μια εμπειρία πολιτισμού, ακόμα και πριν φέρουν το πρώτο πιάτο.

**Fine dining και upscale εστιατόρια**
Στο fine dining, η λεπτομέρεια είναι κρίσιμη. Ένα ψηφιακό μενού σε αυτό το επίπεδο μπορεί να περιλαμβάνει σημειώσεις σομελιέ για wine pairing, προελεύσεις υλικών, ιστορία του chef, δημιουργώντας μια ολοκληρωμένη αφήγηση που ανεβάζει το perceived value της εμπειρίας.

**Fast food και delivery**
Ακόμα και σε fast food περιβάλλοντα, το ψηφιακό μενού επιταχύνει τις παραγγελίες. Στη Menuverse, ο κατάλογος σου μπορεί να ενσωματωθεί εύκολα σε QR code που τοποθετείται στο ταμείο, στα τραπέζια ή ακόμα και σε delivery συσκευασίες.

CTA: Ξεκίνα δωρεάν στη Menuverse

**EN**
- Category: Cafe, Bar & Taverna
- Title: Digital Menu for Every Type of Food Business: Cafe, Bar, Taverna & Fine Dining
- Read time: 5
- Intro: Every food business has different needs. See how a digital menu adapts to each type: from the morning coffee shop to fine dining in the evening.

**Coffee shop and all-day café**
In a café, the catalogue changes frequently: breakfast, lunch, afternoon coffee, evening cocktails. With a digital menu, each "shift" has its own catalogue that activates automatically or with a single click. Customers always see the correct menu for the time they're visiting.

**Bar and cocktail lounge**
In a bar, presentation is everything. A digital cocktail catalogue with photos, flavour descriptions and suggested pairings immediately creates interest and upsell opportunities. Additionally, allergen legislation also applies to beverages, and a digital menu handles this automatically.

**Taverna and traditional cuisine**
The Greek taverna has a unique identity that deserves to be showcased digitally. A well-designed digital menu featuring traditional recipes, stories behind the dishes, and authentic photography gives tourists a cultural experience, even before the first dish arrives at the table.

**Fine dining and upscale restaurants**
In fine dining, detail is everything. A digital menu at this level can include sommelier notes for wine pairing, ingredient provenance, chef background stories, creating a complete narrative that elevates the perceived value of the entire dining experience.

**Fast food and delivery**
Even in fast food environments, a digital menu speeds up ordering. At Menuverse, your catalogue can be easily integrated into a QR code placed at the counter, on tables, or even on delivery packaging, making every touchpoint a conversion opportunity.

CTA: Start free with Menuverse

### A6. Menuverse Guide

**EL**
- Category: Οδηγός Menuverse
- Title: Πώς λειτουργεί η Menuverse: Από την εγγραφή μέχρι το QR κωδικό
- Read time: 3
- Intro: Απλά βήματα, επαγγελματικό αποτέλεσμα. Δες πώς η Menuverse μετατρέπει τον κατάλογό σου σε ψηφιακή εμπειρία.

**Βήμα 1: Δημιουργία λογαριασμού**
Η εγγραφή στη Menuverse διαρκεί λιγότερο από 2 λεπτά. Δεν χρειάζεσαι πιστωτική κάρτα για να ξεκινήσεις: η δωρεάν δοκιμή 30 ημερών σου δίνει πρόσβαση σε όλες τις δυνατότητες ώστε να αξιολογήσεις χωρίς δέσμευση.

**Βήμα 2: Παραγγελία του ψηφιακού σου site**
Μας δίνεις τα στοιχεία της επιχείρησής σου: λογότυπο, χρώματα, φωτογραφίες. Η ομάδα μας δημιουργεί για σένα ένα επαγγελματικό ψηφιακό μενού προσαρμοσμένο στην αισθητική σου. Δεν χρειάζεται να ξέρεις τίποτα από κώδικα ή design.

**Βήμα 3: Προσθήκη πιάτων και περιεχομένου**
Μέσα από τον πίνακα ελέγχου, μπορείς να προσθέσεις κατηγορίες, πιάτα, φωτογραφίες, τιμές, αλλεργιογόνα και περιγραφές. Το interface είναι απλό και διαισθητικό, σαν να συμπληρώνεις μια φόρμα στο Facebook.

**Βήμα 4: Παραλαβή QR κωδικού**
Μόλις το μενού σου είναι έτοιμο, η Menuverse δημιουργεί αυτόματα τον QR κωδικό σου. Τον εκτυπώνεις, τον τοποθετείς στα τραπέζια ή τον κοινοποιείς online, και οι πελάτες σου έχουν άμεση πρόσβαση στον ψηφιακό σου κατάλογο.

**Βήμα 5: Ενημερώσεις σε πραγματικό χρόνο**
Αλλαγή τιμής; Νέο εποχιακό πιάτο; Εξαντλημένο υλικό; Από οποιοδήποτε συσκευή, μπορείς να ενημερώσεις το μενού σου σε δευτερόλεπτα. Χωρίς εκτύπωση, χωρίς αναμονή, χωρίς επιπλέον κόστος.

CTA: Ξεκίνα δωρεάν στη Menuverse

**EN**
- Category: Menuverse Guide
- Title: How Menuverse Works: From Sign-Up to QR Code
- Read time: 3
- Intro: Simple steps, professional results. See how Menuverse turns your catalogue into a digital experience your customers will love.

**Step 1: Create your account**
Signing up for Menuverse takes less than 2 minutes. No credit card required to get started: the 30-day free trial gives you access to all features so you can evaluate without any commitment.

**Step 2: Order your digital site**
You give us your business details: logo, colours, photos. Our team creates a professional digital menu tailored to your aesthetic. No coding or design knowledge required. We handle everything.

**Step 3: Add dishes and content**
Through your dashboard, you can add categories, dishes, photos, prices, allergens and descriptions. The interface is simple and intuitive, as easy as filling in a form on Facebook.

**Step 4: Receive your QR code**
Once your menu is ready, Menuverse automatically generates your QR code. Print it, place it on tables, or share it online, and your customers have instant access to your digital catalogue from any smartphone.

**Step 5: Real-time updates**
Price change? New seasonal dish? Ingredient sold out? From any device, you can update your menu in seconds. No printing, no waiting, no extra cost. Your menu is always accurate and up to date.

CTA: Start free with Menuverse

---

## L. Legal pages (English only on the current site, verbatim)

### L1. Privacy Policy (`/privacypolicy`)

Back to Home

# Privacy Policy

Last Updated: December 18, 2024

**1. Information We Collect**

We collect information that you provide directly to us, including:

- Account Information: When you create an account, we collect your name, email address, and password.
- Business Information: Restaurant name, address, contact details, and menu information.
- Payment Information: Billing details and transaction history (processed securely through our payment providers).
- Usage Data: Information about how you use our service, including menu views, QR code scans, and analytics data.
- Communications: When you contact our support team, we retain correspondence and support tickets.

**2. How We Use Your Information**

We use the collected information for the following purposes:

- To provide, maintain, and improve our digital menu services
- To process your transactions and send related information
- To respond to your comments, questions, and customer service requests
- To send you technical notices, updates, security alerts, and administrative messages
- To monitor and analyze trends, usage, and activities in connection with our services
- To detect, prevent, and address technical issues and fraudulent activity
- To personalize and improve your experience with our service

**3. Information Sharing and Disclosure**

We do not sell your personal information. We may share your information in the following circumstances:

- With Service Providers: We work with third-party service providers who perform services on our behalf, such as payment processing, data analysis, and customer service.
- For Legal Reasons: We may disclose your information if required by law or in response to valid requests by public authorities.
- Business Transfers: In the event of a merger, acquisition, or sale of assets, your information may be transferred.
- With Your Consent: We may share your information with your explicit consent.

**4. Data Security**

We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:

- Encryption of data in transit and at rest
- Regular security assessments and updates
- Access controls and authentication procedures
- Secure data backup and recovery systems

However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.

**5. Data Retention**

We retain your personal information for as long as your account is active or as needed to provide you services. We will retain and use your information as necessary to comply with our legal obligations, resolve disputes, and enforce our agreements.

You may request deletion of your account and associated data at any time by contacting our support team.

**6. Your Rights and Choices**

You have the following rights regarding your personal information:

- Access: Request a copy of the personal information we hold about you
- Correction: Request correction of inaccurate or incomplete information
- Deletion: Request deletion of your personal information
- Data Portability: Request transfer of your data to another service provider
- Opt-Out: Unsubscribe from marketing communications at any time

To exercise these rights, please contact us at privacy@menuverse.com

**7. Cookies and Tracking Technologies**

We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.

For more information, please see our Cookie Policy.

**8. International Data Transfers**

Your information may be transferred to and maintained on computers located outside of your country where data protection laws may differ. By using our service, you consent to the transfer of your information to our facilities and third parties with whom we share it.

**9. Age Requirement**

Our service is intended for users who are 18 years of age or older. We do not knowingly collect personal information from individuals under 18. By using our service, you confirm that you are at least 18 years old. If you are a parent or guardian and believe someone under 18 has provided us with personal information, please contact us immediately.

**10. Changes to This Privacy Policy**

We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.

**11. Contact Us**

If you have any questions about this Privacy Policy, please contact us:

- Email: menuverse.gr@gmail.com
- Message System: Use the chat feature on our website for direct support

[Open Message System]

### L2. Terms of Service (`/termsofservice`)

Back to Home

# Terms of Service

Last Updated: December 18, 2024

**1. Acceptance of Terms**

By accessing and using Menuverse ("Service"), you accept and agree to be bound by the terms and conditions of this agreement. If you do not agree to these terms, you should not use this Service.

This Service is operated by Menuverse and these terms apply to all users of the Service, including restaurant owners, managers, staff, and end customers viewing digital menus.

**2. Description of Service**

Menuverse provides a digital menu creation and management platform that allows restaurants to:

- Create and customize digital menus
- Generate QR codes for menu access
- Update menu items, prices, and availability in real-time
- Track menu analytics and customer engagement
- Manage multiple locations and menu variations
- Provide multi-language menu support

The Service is provided on a subscription basis with different pricing tiers and features.

**3. User Accounts and Registration**

To use certain features of the Service, you must register for an account. When creating an account, you agree to:

- Provide accurate, current, and complete information
- Maintain and promptly update your account information
- Maintain the security of your account credentials
- Accept responsibility for all activities that occur under your account
- Notify us immediately of any unauthorized access or security breaches

You are responsible for maintaining the confidentiality of your account and password. You may not share your account credentials with others or use another person's account without permission.

**4. Subscription and Payment**

Menuverse operates on a subscription model with the following terms:

- Subscriptions are billed monthly or annually based on your chosen plan
- Payment is required in advance for each billing period
- All fees are non-refundable except as required by law
- We reserve the right to change our pricing with 30 days' notice
- Free trials may be offered at our discretion and are subject to these terms
- Failure to pay may result in suspension or termination of your account

You authorize us to charge your payment method for all fees incurred. You are responsible for keeping your payment information current.

**5. Acceptable Use Policy**

You agree not to use the Service to:

- Violate any laws, regulations, or third-party rights
- Post false, misleading, or fraudulent content
- Upload malicious software or code
- Interfere with or disrupt the Service or servers
- Attempt to gain unauthorized access to any part of the Service
- Use the Service for any illegal or unauthorized purpose
- Harass, abuse, or harm other users
- Collect or harvest information about other users without consent
- Impersonate any person or entity

We reserve the right to investigate violations and take appropriate action, including account suspension or termination.

**6. Content Ownership and License**

You retain ownership of all content you upload to the Service, including menu items, descriptions, images, and other materials ("User Content").

By uploading User Content, you grant Menuverse a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display your content solely for the purpose of providing and improving the Service.

You represent and warrant that:

- You own or have the necessary rights to all User Content
- Your User Content does not violate any third-party rights
- Your User Content complies with these Terms and applicable laws

We reserve the right to remove any User Content that violates these Terms or is otherwise objectionable.

**7. Intellectual Property Rights**

The Service and its original content, features, and functionality are owned by Menuverse and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.

You may not:

- Copy, modify, or create derivative works of the Service
- Reverse engineer or attempt to extract source code
- Remove or alter any copyright or proprietary notices
- Use our trademarks without written permission

Any feedback, suggestions, or ideas you provide may be used by us without obligation or compensation.

**8. Third-Party Services and Links**

The Service may contain links to third-party websites or services that are not owned or controlled by Menuverse. We have no control over and assume no responsibility for the content, privacy policies, or practices of third-party websites or services.

You acknowledge and agree that Menuverse shall not be responsible or liable for any damage or loss caused by your use of any third-party content, goods, or services.

**9. Service Availability and Modifications**

We strive to provide reliable service but cannot guarantee:

- Uninterrupted or error-free access
- That defects will be corrected
- That the Service is free from viruses or harmful components
- The accuracy or completeness of any content

We reserve the right to:

- Modify, suspend, or discontinue the Service at any time
- Change these Terms with notice
- Refuse service to anyone for any reason
- Remove or modify features without liability

Scheduled maintenance and updates will be communicated in advance when possible.

**10. Termination**

We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including:

- Breach of these Terms
- Non-payment of fees
- Fraudulent or illegal activity
- Upon your request

Upon termination:

- Your right to use the Service will immediately cease
- You will lose access to your account and User Content
- We may delete your account and data after a reasonable period
- Outstanding fees remain due and payable

You may cancel your subscription at any time through your account settings. Cancellation will be effective at the end of the current billing period.

**11. Disclaimers and Limitation of Liability**

THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.

TO THE MAXIMUM EXTENT PERMITTED BY LAW, MENUVERSE SHALL NOT BE LIABLE FOR:

- Any indirect, incidental, special, consequential, or punitive damages
- Loss of profits, revenue, data, or use
- Business interruption or loss of goodwill
- Any damages resulting from your use or inability to use the Service

OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE 12 MONTHS PRECEDING THE CLAIM.

Some jurisdictions do not allow certain limitations of liability, so some of the above limitations may not apply to you.

**12. Indemnification**

You agree to indemnify, defend, and hold harmless Menuverse, its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses, including reasonable attorneys' fees, arising out of or in any way connected with:

- Your use of the Service
- Your violation of these Terms
- Your violation of any rights of another party
- Your User Content

**13. Governing Law and Dispute Resolution**

Any disputes arising out of or relating to these Terms or the Service shall be resolved through good faith negotiation between the parties. Nothing in this section shall prevent us from seeking injunctive relief in court to protect our intellectual property rights.

**14. General Provisions**

- Entire Agreement: These Terms constitute the entire agreement between you and Menuverse.
- Severability: If any provision is found unenforceable, the remaining provisions will remain in effect.
- No Waiver: Our failure to enforce any right or provision shall not constitute a waiver.
- Assignment: You may not assign these Terms without our consent. We may assign our rights and obligations without restriction.
- Force Majeure: We shall not be liable for any failure to perform due to circumstances beyond our reasonable control.
- Notices: Legal notices will be sent to the email address associated with your account.

**15. Contact Information**

If you have any questions about these Terms of Service, please contact us:

- Email: menuverse.gr@gmail.com
- Message System: Use the chat feature on our website for direct support

[Open Message System]

---

## N. Issues found in the current site (fix or decide before launch)

1. **Greek headings fall back to another font.** Plus Jakarta Sans has no Greek glyphs. The new type system fixes this.
2. **`<html lang>` stays `el-GR` in every language.** Breaks Greek uppercase rules and screen readers. Fixed in the spec (3.2).
3. **Hero chips and the language tooltip are English-only** in the Greek site. Translated in this pack.
4. **Two privacy contact emails:** the Privacy Policy says privacy@menuverse.com in section 6 and menuverse.gr@gmail.com in section 11. Pick one.
5. **"Cookie Policy" is linked in Privacy section 7 but the page doesn't exist.** Either add one or remove the sentence.
6. **Copyright says © 2024.** The new footer uses the current year automatically.
7. **"Ενταχθείτε σε χιλιάδες επιχειρήσεις" / "Join thousands of restaurants"** and the FAQ's "κορυφαία ελληνική πλατφόρμα" / "leading platform": make sure these are accurate before launch. EU consumer-protection rules treat unsupported claims like these as misleading advertising. A softer line works just as well on a premium site.
8. **Article typos (kept as-is above, suggested fixes):**
   - A3 heading "Λιγότεροι λανθασμένοι ζητήματα επικοινωνίας" → "Λιγότερες παρεξηγήσεις στην επικοινωνία"
   - A2 "μειώνει τον φαινόμενο χρόνο αναμονής" → "μειώνει τον αντιληπτό χρόνο αναμονής"
   - A6 "Από οποιοδήποτε συσκευή" → "Από οποιαδήποτε συσκευή"
   - A5 "σoμελιέ" contained a Latin letter "o" (bad for search); already corrected to "σομελιέ" in this pack.
9. **"Τάσεις 2025" / "2025 Trends"** (A4) will look dated in 2026. Consider updating the year or the framing.
10. **FAQ JSON-LD has no visible FAQ on the page.** Search engines expect structured data to match visible content. Either add a small FAQ block or keep it knowing it may be ignored.
11. **Em dashes** in the original copy were replaced with commas, colons or full stops throughout this pack.
