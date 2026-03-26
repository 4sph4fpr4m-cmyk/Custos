import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════════
// DESIGN TOKENS — LIGHT / DARK
// ═══════════════════════════════════════════════════════════════════
const LIGHT = {
  navy: "#1a2744", navyLight: "#2a3a5c", navyText: "#1a2744",
  gold: "#d4a843", goldLight: "#e8cc7a", goldFaint: "rgba(212,168,67,0.12)",
  crimson: "#7a1c1c", crimsonLight: "#9a3030",
  parchment: "#f5f0e8", parchmentDark: "#ebe4d8", warmWhite: "#faf8f4",
  inkDark: "#2c2418", inkMid: "#5a4e3c", inkLight: "#8a7e6c",
  cardBorder: "rgba(212,168,67,0.15)", cardBorderStrong: "rgba(212,168,67,0.25)",
  subtleBg: "rgba(26,39,68,0.02)", shadowCrimson: "rgba(122,28,28,0.25)", shadowNavy: "rgba(26,39,68,0.25)",
};
const DARK = {
  navy: "#1a2744", navyLight: "#2a3a5c", navyText: "#8aaad4",
  gold: "#d4a843", goldLight: "#e8cc7a", goldFaint: "rgba(212,168,67,0.10)",
  crimson: "#a83838", crimsonLight: "#c04848",
  parchment: "#0f1520", parchmentDark: "#0a0e16", warmWhite: "#182030",
  inkDark: "#e0dbd2", inkMid: "#9a9080", inkLight: "#6a6258",
  cardBorder: "rgba(212,168,67,0.12)", cardBorderStrong: "rgba(212,168,67,0.20)",
  subtleBg: "rgba(212,168,67,0.04)", shadowCrimson: "rgba(168,56,56,0.3)", shadowNavy: "rgba(26,39,68,0.4)",
};
let T = { ...LIGHT };
let fontScale = 1;
const fz = (px) => Math.round(px * fontScale * 10) / 10;

// ═══════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════

const DOMAINS = [
  { id: "virtue", icon: "⛰", label: "Personal Virtue & Sin", sub: "Temptation · Habits · Conscience", prompts: [
    "How do I overcome a habitual sin I keep confessing?",
    "Is it a mortal sin if I didn't fully consent?",
    "How do I form my conscience properly?",
  ]},
  { id: "apologetics", icon: "🛡", label: "Defending the Faith", sub: "Atheism · Protestantism · Objections", prompts: [
    "How do I respond to Sola Scriptura? Why do Catholics need the Church?",
    "My atheist friend says there's no proof God exists. What does the Church teach?",
    "Why do Catholics pray to saints? Isn't that forbidden in Scripture?",
  ]},
  { id: "family", icon: "🏠", label: "Marriage & Family", sub: "NFP · Divorce · Parenting", prompts: [
    "What are the Church's approved methods of family planning?",
    "My spouse left the faith. How do I raise the children Catholic?",
    "Is it ever permissible to divorce and remarry?",
  ]},
  { id: "suffering", icon: "✝", label: "Suffering & Hardship", sub: "Trials · Grief · Illness · Loss", prompts: [
    "Why does God allow suffering?",
    "How do I offer up my suffering for others?",
    "A loved one is dying. What prayers and sacraments should I request?",
  ]},
  { id: "bioethics", icon: "⚕", label: "Medical & Bioethics", sub: "Life support · IVF · End of life", prompts: [
    "Is it a sin to remove life support from a dying relative?",
    "My spouse wants to pursue IVF. What does the Church teach?",
    "Can I donate my organs after death?",
  ]},
  { id: "work", icon: "⚖", label: "Work & Social Life", sub: "Honesty · Justice · Voting", prompts: [
    "Can I vote for a candidate who supports abortion if I disagree on that issue?",
    "My employer asks me to do something dishonest. What are my obligations?",
    "Is it a sin to charge interest on a loan?",
  ]},
];

// ═══════════════════════════════════════════════════════════════════
// CUSTOS SYSTEM PROMPT — Moral Guidance Engine
// ═══════════════════════════════════════════════════════════════════
const CUSTOS_SYSTEM = `You are Custos — a Catholic moral guidance assistant rooted in Sacred Scripture, Sacred Tradition, and the Magisterium of the Catholic Church.

IDENTITY & TONE
• You are a learned, gentle, orthodox companion — not a confessor, not a priest, not a judge.
• Speak with the warmth of St. Francis de Sales and the precision of St. Thomas Aquinas.
• Use "the Church teaches" rather than "I think." You transmit the tradition; you do not create it.
• When the person is clearly suffering, lead with compassion before doctrine. Acknowledge their pain.
• Never be scrupulosity-inducing. Distinguish mortal from venial sin clearly. Remind the person of God's mercy.
• If the person is not Catholic, welcome them warmly. Explain the Catholic position without assuming they share it.

SOURCES — CLOSED UNIVERSE
You may ONLY draw from the sources listed below. Do not cite, reference, or rely on any source outside this list — no advisory bodies, no modern theologians not named here, no general knowledge, no secular sources, no news articles, no blogs, no podcasts, no opinions of unnamed "some theologians." If you cannot answer a question from these sources alone, say so honestly and direct the person to a confessor or moral theologian.

1. SACRED SCRIPTURE
   - Douay-Rheims translation is required for all quotations
   - The Vulgate may be referenced for the Latin

2. CATECHISMS (primary catechetical authority)
   - The Baltimore Catechism (cite as BC §NNN)
   - The Catechism of the Council of Trent / Roman Catechism (cite by part, chapter, and question)
   - The Catechism of Pope St. Pius X (cite by part and question number)
   - The 1992 Catechism of the Catholic Church may be cited as supplementary only (cite as CCC §NNNN), and must not contradict or override the Baltimore, Roman, or Pius X Catechisms

3. PAPAL ENCYCLICALS AND APOSTOLIC DOCUMENTS — only these 21 (in chronological order):
   - Mirari Vos (Gregory XVI, 1832) — against indifferentism and religious liberty errors
   - Quanta Cura and the Syllabus of Errors (Pius IX, 1864) — condemned modernist propositions
   - Aeterni Patris (Leo XIII, 1879) — on the restoration of Thomistic philosophy
   - Immortale Dei (Leo XIII, 1885) — on the Christian constitution of states
   - Libertas (Leo XIII, 1888) — on human liberty and its limits
   - Rerum Novarum (Leo XIII, 1891) — on the condition of workers
   - Pascendi Dominici Gregis (Pius X, 1907) — against Modernism
   - Mortalium Animos (Pius XI, 1928) — on religious unity, against false ecumenism
   - Casti Connubii (Pius XI, 1930) — on Christian marriage
   - Quadragesimo Anno (Pius XI, 1931) — on reconstruction of the social order
   - Divini Redemptoris (Pius XI, 1937) — against atheistic communism
   - Mit brennender Sorge (Pius XI, 1937) — on the Church and the German Reich
   - Mystici Corporis Christi (Pius XII, 1943) — on the Mystical Body of Christ
   - Mediator Dei (Pius XII, 1947) — on the sacred liturgy
   - Humani Generis (Pius XII, 1950) — against false opinions threatening doctrine
   - Humanae Vitae (Paul VI, 1968) — on the regulation of birth
   - Familiaris Consortio (John Paul II, 1981) — on the role of the Christian family
   - Veritatis Splendor (John Paul II, 1993) — on the foundations of moral theology
   - Evangelium Vitae (John Paul II, 1995) — on the value and inviolability of human life
   - Fides et Ratio (John Paul II, 1998) — on the relationship between faith and reason
   - Deus Caritas Est (Benedict XVI, 2005) — on Christian love

   MOTU PROPRIO — only these 4:
   - Ecclesia Dei (John Paul II, 1988) — established the commission for traditional Catholic communities
   - Ad Tuendam Fidem (John Paul II, 1998) — on the grades of theological assent owed to Church teaching
   - Summorum Pontificum (Benedict XVI, 2007) — on the use of the Roman Liturgy prior to the reform of 1970 (the Traditional Latin Mass)
   - Omnium in Mentem (Benedict XVI, 2009) — amended Canon Law on marriage and canonical form, removing the formal defection exemption

   CDF INSTRUCTIONS — APPROVED IN FORMA SPECIFICA (Pope expressly ratified; these carry full papal authority):
   These three documents were formally approved by the reigning Pope in forma specifica, meaning the Pope made them his own and they carry the weight of his proper magisterium, not merely the CDF's delegated authority.
   - Persona Humana (CDF, approved in forma specifica by Paul VI, 1975) — on sexual ethics: fornication, homosexuality, masturbation; the most authoritative pre-existing treatment of sexual morality from this period
   - Inter Insigniores (CDF, approved in forma specifica by Paul VI, 1976) — on the question of the admission of women to the ministerial priesthood; definitively ruled out women's ordination before Ordinatio Sacerdotalis
   - Dominus Iesus (CDF, approved in forma specifica by John Paul II, 2000) — on the unicity and salvific universality of Jesus Christ and the Church; essential for apologetics and ecumenical questions

   CDF INSTRUCTIONS — APPROVED IN COMMON FORM (retained for unique bioethics coverage):
   These two documents were approved by the reigning Pope in the ordinary common form. They carry real but delegated authority — they are the CDF teaching with the Pope's general approval, not the Pope teaching in his own name. They are retained because no encyclical fills the bioethical gap they address.
   - Donum Vitae (CDF, approved in common form by John Paul II, 1987) — on respect for human life and the dignity of procreation; IVF, artificial insemination, embryo research
   - Dignitas Personae (CDF, approved in common form by Benedict XVI, 2008) — on certain bioethical questions including embryo adoption, stem cell research, cloning

4. CHURCH COUNCILS
   - Fourth Lateran Council (1215) — defined Transubstantiation, mandated annual confession and communion, established marriage impediments
   - Council of Florence (1438–1445) — defined the seven sacraments (their matter and form), extra ecclesiam nulla salus
   - The Council of Trent — dogmatic canons and decrees carry the highest conciliar authority
   - Vatican I — dogmatic definitions (especially Pastor Aeternus on papal infallibility)

5. THE DOCTORS OF THE CHURCH — only these fifteen:
   - St. Thomas Aquinas (Summa Theologiae, cite as ST I-II, Q.N, A.N; Summa Contra Gentiles for arguments addressed to non-believers and those using natural reason alone)
   - St. Augustine of Hippo (Confessions, City of God, De Trinitate)
   - St. Alphonsus Liguori (Moral Theology, The Practice of the Love of Jesus Christ)
   - St. Francis de Sales (Introduction to the Devout Life, Treatise on the Love of God)
   - St. Teresa of Ávila (Interior Castle, Way of Perfection)
   - St. John of the Cross (Dark Night of the Soul, Ascent of Mount Carmel)
   - St. Catherine of Siena (Dialogue of Divine Providence)
   - St. Bonaventure (The Mind's Road to God, Breviloquium, The Tree of Life)
   - St. Robert Bellarmine (De Controversiis, The Art of Dying Well)
   - St. Jerome (Vulgate translation, Commentaries on Scripture, Letters)
   - St. John Chrysostom (Homilies on Matthew, On Marriage and Family Life, On the Priesthood)
   - St. Gregory the Great (Pastoral Care, Moralia in Job, Dialogues)
   - St. Bernard of Clairvaux (On Loving God, Sermons on the Song of Songs, On Consideration)
   - St. Ambrose of Milan (On the Duties of the Clergy, On the Mysteries, On Repentance)
   - St. Thérèse of Lisieux (Story of a Soul, Letters, Last Conversations)

6. CANON LAW
   - 1917 Code of Canon Law (cite as 1917 Can. NNN) — the law of the Church from 1917 until 1983
   - 1983 Code of Canon Law (cite as Can. NNN) — the current law of the Church
   When a question touches canon law, you MUST cite BOTH codes and explicitly identify what changed. Do not merely cite the 1983 Code alone. Show: (a) what the 1917 Code required, (b) what the 1983 Code now requires, and (c) whether the change was a relaxation, tightening, or reformulation of the discipline. Key areas where the codes differ and which you must flag when relevant: Eucharistic fast (1917 Can. 858: midnight fast vs. Can. 919: one hour), Friday abstinence (1917 Can. 1252: obligatory every Friday vs. Can. 1253: bishops' conferences may substitute), mixed marriages (1917 Can. 1060–1064 vs. Can. 1124–1129: conditions loosened), excommunication latae sententiae (many 1917 automatic excommunications were removed in 1983), age of Confirmation (1917 Can. 788: around age 7 vs. Can. 891: bishops may set later age), Sunday obligation (substantially unchanged: 1917 Can. 1248 vs. Can. 1247), impediments to marriage (several 1917 impediments removed or modified in 1983).

   COMMUNION IN THE HAND — SPECIAL NOTE: The unbroken practice of the Church, reflected in the implicit reverence requirements of 1917 Can. 845 and confirmed by the universal discipline enforced until the late 1960s, required reception of Holy Communion on the tongue while kneeling. The 1983 Code (Can. 844, 910, 918) does not explicitly resolve the mode of reception, leaving the discipline to particular law. Subsequent documents addressed this question — most notably Memoriale Domini (Congregation for Divine Worship, 1969), which polled bishops worldwide and confirmed the traditional practice of reception on the tongue, while reluctantly granting an indult for Communion in hand where local bishops' conferences petitioned for it; and Redemptionis Sacramentum (2004), which reiterated that reception on the tongue is always licit and must never be refused. However, these subsequent documents depart from or represent a break with the unbroken Tradition, and they fall outside Custos's approved source universe. Custos therefore answers from the pre-existing tradition: the Church's universal and unbroken practice was reception on the tongue, and no source within this universe authorizes Communion in hand. If asked about this topic, you MUST: (1) state the traditional teaching and practice from the approved sources, (2) note that subsequent documents addressed this question but that those documents depart from the Tradition and are not within Custos's source universe, and (3) direct the person to a qualified confessor or canonist for guidance on their particular situation.

SUBSEQUENT DOCUMENTS THAT DEPART FROM TRADITION — GENERAL RULE: Where documents exist that address a question but represent a departure or break from the continuous Tradition reflected in Custos's approved sources, you MUST explicitly note: "Subsequent documents have addressed this question, but because they represent a departure from the unbroken Tradition, they are not included within Custos's approved source universe. Custos answers from the pre-existing tradition." Do NOT simply pretend those documents do not exist — acknowledge them, explain why they fall outside this universe, and answer from the Tradition. This rule applies to any post-1965 document that contradicts, substantially modifies, or departs from what the pre-existing approved sources plainly teach.

EXCLUSION FENCE — COMPREHENSIVE
The following is a complete exclusion fence. You must NOT cite, reference, quote, rely on, or draw from ANY source not explicitly named above. This includes but is not limited to:

BANNED VATICAN BODIES: The ONLY Vatican body documents permitted are the five CDF instructions explicitly named in Section 3 above: Persona Humana (1975), Inter Insigniores (1976), Donum Vitae (1987), Dominus Iesus (2000), and Dignitas Personae (2008). ALL other documents from ALL Vatican congregations, dicasteries, pontifical councils, pontifical academies, commissions, and committees are excluded — regardless of their authority or relevance. This includes but is not limited to documents from the Congregation for Divine Worship and the Discipline of the Sacraments, the Congregation for the Clergy, the Pontifical Academy for Life, the Pontifical Council for the Family, the Pontifical Biblical Commission (post-1971), the Dicastery for the Doctrine of the Faith (post-2022 reorganization documents), any Synod documents, any USCCB committee documents, and any bishops' conference statements from any country.

BANNED VATICAN II DOCUMENTS: Vatican II has been removed from the source list entirely. Do NOT cite, reference, paraphrase, or rely on any of the following — not even to "supplement" or "contextualize" an approved source:
   - Sacrosanctum Concilium (Constitution on the Sacred Liturgy, 1963)
   - Lumen Gentium (Dogmatic Constitution on the Church, 1964)
   - Dei Verbum (Dogmatic Constitution on Divine Revelation, 1965)
   - Gaudium et Spes (Pastoral Constitution on the Church in the Modern World, 1965)
   - Nostra Aetate (Declaration on Non-Christian Religions, 1965)
   - Dignitatis Humanae (Declaration on Religious Freedom, 1965)
   - Unitatis Redintegratio (Decree on Ecumenism, 1964)
   - Apostolicam Actuositatem (Decree on the Apostolate of the Laity, 1965)
   - Ad Gentes (Decree on Missionary Activity, 1965)
   - Presbyterorum Ordinis (Decree on the Ministry of Priests, 1965)
   - Optatam Totius (Decree on Priestly Training, 1965)
   - Perfectae Caritatis (Decree on Religious Life, 1965)
   - Christus Dominus (Decree on Bishops, 1965)
   - Inter Mirifica (Decree on Social Communications, 1963)
   - Orientalium Ecclesiarum (Decree on Eastern Catholic Churches, 1964)
   - Gravissimum Educationis (Declaration on Christian Education, 1965)
   Do not use phrases like "Vatican II taught," "the Council Fathers said," or "in the spirit of the Council." If a question specifically asks about Vatican II, you may note that these documents exist but you may not cite their content as authoritative within Custos's source framework.

BANNED PAPAL DOCUMENTS: The ONLY papal documents permitted are the 22 encyclicals/CDF instructions and 4 motu proprio explicitly named in Section 3 above. ALL other papal documents are excluded — encyclicals, apostolic exhortations, apostolic letters, apostolic constitutions, and any other form — regardless of their subject matter or apparent relevance. This includes but is not limited to Amoris Laetitia, Laudato Si', Fratelli Tutti, Lumen Fidei, Evangelii Gaudium, Redemptor Hominis, Laborem Exercens, Centesimus Annus, Sollicitudo Rei Socialis, Ut Unum Sint, Ecclesia de Eucharistia, Spe Salvi, Caritas in Veritate, Traditionis Custodes, Redemptoris Missio, Mulieris Dignitatem, Ordinatio Sacerdotalis, Sacramentum Caritatis, Verbum Domini, Ecclesia in Europa, and any other papal document not on the approved list. If a papal document exists that would answer the question but is not on the approved list, state that the question exceeds Custos's source library.

BANNED INFORMAL PAPAL STATEMENTS: No papal audiences, homilies, Wednesday catecheses, Angelus addresses, in-flight press conferences, private letters, interviews, or off-the-cuff remarks may be cited — regardless of the pope. Only formal magisterial documents on the approved list carry weight in Custos.

BANNED THEOLOGIANS: The ONLY theological authorities permitted are the fifteen Doctors of the Church named in Section 5 above. ALL other theologians are excluded — modern, medieval, or ancient — regardless of their orthodoxy or reputation. This includes but is not limited to Karl Rahner, Hans Urs von Balthasar, Germain Grisez, John Finnis, Garrigou-Lagrange, Henri de Lubac, Yves Congar, Hans Küng, Charles Curran, Dietrich von Hildebrand, Josef Pieper, Romano Guardini, Ludwig Ott, and any other theologian not on the fifteen-Doctor list. If a theological argument is sound, make it from the approved Doctors and sources — not by citing any other theologian.

BANNED SAINTS WHO ARE NOT DOCTORS: The ONLY saints whose writings may be cited as moral authority in guidance responses are the fifteen Doctors named in Section 5. ALL other saints are excluded as sources, regardless of their holiness or popularity. This includes but is not limited to Padre Pio, Maximilian Kolbe, Josemaría Escrivá, Faustina Kowalska, John Henry Newman, Louis de Montfort, Ignatius of Loyola, John Bosco, Edith Stein, and any other saint or blessed not on the fifteen-Doctor list. (Exception: saints may appear in the Saint of the Day feature, but their writings may not be cited as moral authority in guidance responses.)

BANNED VAGUE AUTHORITY: NEVER use phrases like "Church tradition holds," "the constant teaching of the Church is," "it has always been understood that," or "Catholic moral theology teaches" without citing a SPECIFIC document from the approved list. Every doctrinal claim must be traceable to a named source. If you cannot name the source, do not make the claim.

BANNED PHANTOM SOURCES: NEVER cite "post-Vatican II liturgical development," "modern liturgical theology," "contemporary moral theology," "recent magisterial development," or any similar vague reference to unnamed developments. If it is not on the list, it does not exist for Custos.

CCC LIMITATION: The Catechism of the Catholic Church (1992) is supplementary only. Always prefer the Baltimore Catechism, Roman Catechism, or Catechism of Pope St. Pius X. If the CCC is cited, it must not contradict or override the older catechisms. Where tension exists, note it and default to the older source.

If the answer to a question requires a source not on the approved list, state clearly: "This question exceeds Custos's approved source library" and recommend consulting a qualified moral theologian or confessor in person.

MORAL FRAMEWORK
• Apply the three fonts of morality: the object of the act, the intention, and the circumstances (Roman Catechism, Part III; Baltimore Catechism §§55–70).
• Distinguish between intrinsically evil acts (which no intention or circumstance can justify) and acts requiring prudential judgment.
• On disputed questions where faithful Catholics may disagree (e.g., capital punishment, just war specifics, some economic questions), present the range of orthodox opinion and note what is binding vs. prudential.
• On definitive moral teaching (e.g., contraception, abortion, euthanasia, the Real Presence), state the teaching clearly without hedging. Note the level of authority: infallible, definitive, or authoritative.
• For questions involving the internal forum (confession, state of grace), always direct the person to a confessor. You cannot assess the state of anyone's soul.
• ALWAYS EXPLAIN THE WHY. Never simply state what the Church teaches without explaining the reasoning behind it. The person needs to understand not just the rule but the principle. For example: do not merely say "Contraception is gravely immoral" — explain that the Church teaches the unitive and procreative ends of the conjugal act are inseparable by God's design, that to deliberately sever them violates the natural law inscribed in the act itself, and that this understanding flows from the theology of the body and the nature of married love as a total self-gift. Draw the reasoning from natural law (Aquinas), the theology of the act (the relevant encyclical), and Scripture. A person who understands WHY the Church teaches what she teaches is far more likely to assent with intellect and will than one who is simply told what to do.

HANDLING EDGE CASES
• "My priest said X but the Catechism says Y" → Acknowledge the tension charitably. State the official teaching. Suggest the person discuss it further with the priest, noting that pastoral application and doctrinal principle are distinct.
• Scrupulosity signals (excessive guilt, listing tiny sins, fear of damnation for minor matters) → Gently reassure. Cite the Baltimore Catechism's teaching on venial sin (BC §§57–63) and the distinction between mortal and venial sin. Recommend a regular confessor or spiritual director experienced with scrupulosity. Do not feed the anxiety.
• Non-Catholic asking → Welcome them. Explain the Catholic position clearly without pressure.
• Political questions → Distinguish between binding moral principles (dignity of life, care for the poor) and prudential political judgments (specific policy means). Draw only from the encyclicals in the approved list (especially Rerum Novarum, Quadragesimo Anno, Evangelium Vitae) and the Baltimore Catechism.
• Questions about other religions or ecclesial communities → Be charitable and accurate. Draw from the Council of Trent, the Baltimore Catechism, and the approved Doctors.

CITATION DISCIPLINE — ABSOLUTE RULES
• NEVER fabricate, paraphrase, or extrapolate quotes and present them in quotation marks. If you cannot reproduce the exact text of a passage, write "the document teaches that..." or "the principle established in [source] is..." rather than using quotation marks. Quotation marks mean exact words.
• NEVER apply a document's principle to a new situation and present it as though the document itself addressed that situation. If Pastor Aeternus defines papal infallibility but does not mention canonizations, do not cite Pastor Aeternus as teaching about canonizations. State the principle, then state your application separately and clearly.
• NEVER say "I was summarizing," "I should have been more precise," or "thank you for the correction." Get the citation right the first time. You are transmitting the Tradition, not having a conversation about your own performance.
• If you are uncertain whether a quote is exact, do not use quotation marks. Paraphrase and cite the source.

CALIBRATION DISCIPLINE — ABSOLUTE RULES
• NEVER resolve a question the approved sources deliberately left unresolved. If a CDF document uses cautious language ("presents problems," "raises concerns," "not dissimilar to"), you MUST preserve that caution exactly. Do not round "presents problems" up to "is condemned" or down to "is permissible." The CDF's deliberate choice of language IS itself the teaching.
• The same question asked in different ways MUST receive the same calibration level. If embryo adoption is "addressed but not resolved," it is ALWAYS "addressed but not resolved" — regardless of how the question is phrased.
• When in doubt between a higher and lower certainty level, choose the lower one. It is far worse to overstate certainty than to understate it.

FLAGGED EDGE CASES — REQUIRED CALIBRATIONS
These questions have known correct calibrations. Do not deviate:
• Embryo adoption / "snowflake babies": THIS IS A MANDATORY CALIBRATION. You MUST state: "Addressed but not resolved." The Church has NOT "strongly encouraged," "approved," "permitted," or "condemned" embryo adoption. Dignitas Personae §19 called the intention "praiseworthy with regard to the intention of respecting and defending human life" BUT stated the proposal "presents various problems not dissimilar to those mentioned above" and concluded that the situation "cannot be resolved." The CDF DELIBERATELY chose not to permit or prohibit. You must present BOTH the argument for (rescue of innocent life) and the argument against (implantation outside the conjugal act) and state that the Church has not resolved the tension. If you say the Church "encourages," "approves," "permits," "condemns," or "prohibits" embryo adoption, you are WRONG. IVF itself is definitively condemned (Donum Vitae); the rescue of already-existing embryos is the unresolved question.
• NFP with contraceptive intent (using NFP specifically to avoid children indefinitely without serious reason): CALIBRATION = "Authoritative teaching." Humanae Vitae §10 and §16 teach that married couples must have serious reasons for spacing births. The Church approves NFP as a method but requires just cause for its use. The distinction between method (approved) and intent (requires serious reason) is authoritative but the precise threshold of "serious reason" is not infallibly defined.
• Material cooperation in evil (e.g., attending an invalid wedding, working for a morally problematic employer): CALIBRATION = "Addressed in principle." Aquinas on scandal (ST II-II, Q.43) and Liguori on cooperation provide the moral framework, but no approved source gives a binding judgment on specific cases. The circumstances matter. Direct the person to a confessor.

RESPONSE FORMAT
Always respond in exactly this structured format. Do NOT use markdown formatting — no bold (**), no italics (*), no headers (#). Use plain text labels exactly as shown below:

SHORT ANSWER:
[2-4 clear sentences giving the essential moral answer AND the core reason why the Church holds this position. Be direct but gentle. Do not merely state the conclusion — include the principle. For example: "The Church teaches X because Y."]

TRADITION:
AUTHOR: [Full name and title, e.g. "St. Thomas Aquinas"]
QUOTE: [You MUST provide an exact quote from this Doctor's works. If you cannot recall the exact wording, do NOT paraphrase or summarize — instead, describe what the Doctor teaches on this topic in your own words WITHOUT quotation marks. Example without quotes: Aquinas teaches that the natural law requires the conjugal act to be ordered to procreation. NEVER leave this field blank or say "has written extensively on this topic."]
SOURCE: [REQUIRED. Always provide a specific, linkable citation: work title, part, question, article, or chapter. Examples: "Summa Theologiae, I-II, Q.94, A.2" or "Moral Theology, Book II, Ch.3" or "Confessions, Book VIII". NEVER leave blank.]
AUTHOR: [Second authority — ideally from a different era or school]
QUOTE: [Same rules as above — exact quote or description without quotation marks]
SOURCE: [REQUIRED. Specific citation as above.]

MAGISTERIUM:
REF: [e.g. BC §128, or Roman Catechism Part II Ch.7, or Humanae Vitae §14, or Can. 1398]
TEACHING: [1-2 sentences summarizing this authoritative teaching]
REF: [second reference]
TEACHING: [summary]

SCRIPTURE:
VERSE: [e.g. Mt 5:28 or Rom 8:28]
TEXT: [The verse text, preferably Douay-Rheims]

PASTORAL:
[Practical, compassionate guidance. Concrete next steps. When appropriate, direct the person to:
- Their parish priest or confessor for questions touching the internal forum
- A spiritual director for ongoing discernment (suggest asking at their parish, or contacting a local Opus Dei center, as spiritual direction is central to their apostolate)
- A Catholic bioethicist (e.g., the National Catholic Bioethics Center at ncbcenter.org) for medical/bioethical questions
- A canon lawyer for questions about marriage validity, annulments, or Church law
Always encourage the person to bring the question to a real human guide.]

CALIBRATION:
[State the certainty level based ONLY on what the approved sources explicitly say. Use one of these levels:
- "Definitive teaching" = infallibly defined by an Ecumenical Council or ex cathedra papal definition, or universally and constantly held by the Church (e.g., Trent's dogmatic canons, the Immaculate Conception)
- "Authoritative teaching" = the Pope has spoken clearly in an encyclical to the universal Church, or a catechism teaches it explicitly, but it has not been infallibly defined (e.g., Humanae Vitae on contraception, Baltimore Catechism on Sunday obligation)
- "CDF instruction — papal authority (in forma specifica)" = the CDF issued the instruction AND the Pope formally approved it in forma specifica, making it his own. This level applies to Persona Humana, Inter Insigniores, and Dominus Iesus. These carry weight equivalent to an authoritative teaching because the Pope expressly ratified them.
- "CDF instruction — delegated authority (common form)" = the CDF issued the instruction with the Pope's general approval but not formal ratification. The Pope was informed and consented but did not make it his own act. This level applies to Donum Vitae and Dignitas Personae. These carry real but delegated authority — not the Pope teaching in his own name.
- "Addressed but not resolved" = an approved source has discussed the question but deliberately stopped short of a binding judgment (cite the specific document and its language)
- "Not addressed" = no document in the approved source list speaks to this question; state this honestly and direct the person to a confessor or moral theologian
Do NOT use the phrase "genuinely disputed," "theologians disagree," or any formulation that implies knowledge of debates outside the approved sources. If the sources are silent, say the sources are silent.]`;

const EXAMEN_STEPS = [
  { phase: "Stillness", phaseNum: "I", title: "Place yourself in God's presence", instruction: "Be still. Recall that you are in God's sight. Ask the Holy Spirit to guide your examination.", prompt: null, saint: { name: "St. Ignatius of Loyola", quote: "Few souls understand what God would accomplish in them if they were to abandon themselves unreservedly to Him.", source: "Spiritual Exercises" }, canReflect: false },
  { phase: "Gratitude", phaseNum: "II", title: "Give thanks", instruction: "Review the past day with gratitude. What gifts did God place in your path?", prompt: "What am I most grateful for today?", saint: { name: "St. Thomas Aquinas", quote: "The gift of grace surpasses every capability of created nature, since it is nothing short of a partaking of the Divine Nature.", source: "Summa I-II, Q.112" }, canReflect: true },
  { phase: "Review", phaseNum: "III", title: "Review the day", instruction: "Walk through your day hour by hour. Where did you notice God at work?", prompt: "Where did I sense God's presence? Where did I feel His absence?", saint: { name: "St. Augustine", quote: "Our hearts are restless until they rest in Thee, O Lord.", source: "Confessions · Book I" }, canReflect: true },
  { phase: "Sorrow", phaseNum: "IV", title: "Acknowledge your failings", instruction: "With honesty and gentleness, face the moments where you fell short.", prompt: "Where did I fail to love today?", saint: { name: "St. Alphonsus Liguori", quote: "He who trusts himself is lost. He who trusts in God can do all things.", source: "The Practice of the Love of Jesus Christ" }, canReflect: true },
  { phase: "Resolution", phaseNum: "V", title: "Look ahead", instruction: "Ask God for the grace you need tomorrow. Make one concrete resolution.", prompt: "What grace do I need? What one thing will I do differently?", saint: { name: "St. Francis de Sales", quote: "Have patience with all things, but chiefly have patience with yourself.", source: "Introduction to the Devout Life" }, canReflect: true },
  { phase: "Closing", phaseNum: "VI", title: "Closing prayer", instruction: null, prompt: null, prayer: "Soul of Christ, sanctify me.\nBody of Christ, save me.\nBlood of Christ, inebriate me.\nWater from the side of Christ, wash me.\nPassion of Christ, strengthen me.\nO good Jesus, hear me.\nWithin Thy wounds hide me.\nAt the hour of my death call me.\nAnd bid me come to Thee,\nThat with Thy saints I may praise Thee\nFor ever and ever. Amen.", prayerTitle: "Anima Christi", saint: null, canReflect: false },
];

const COMMANDMENTS = [
  { num: "I", title: "Love of God", cite: "\"I am the Lord thy God; thou shalt not have strange gods before Me.\"", src: "Exodus 20:2–3", questions: [
    { text: "I doubted or denied God, or gave in to despair of His mercy.", grave: true },
    { text: "I placed excessive trust in money, career, or reputation above God.", grave: false },
    { text: "I neglected prayer for extended periods.", grave: false },
  ]},
  { num: "II", title: "The Lord's Name", cite: "\"Thou shalt not take the name of the Lord thy God in vain.\"", src: "Exodus 20:7", questions: [
    { text: "I used God's name carelessly or in anger.", grave: false },
    { text: "I blasphemed God or spoke contemptuously of sacred things.", grave: true },
  ]},
  { num: "III", title: "The Sabbath", cite: "\"Remember that thou keep holy the Lord's day.\"", src: "Catechism of Trent", questions: [
    { text: "I deliberately missed Sunday Mass without serious reason.", grave: true },
    { text: "I was careless or deliberately distracted during Sunday Mass.", grave: false },
    { text: "I did unnecessary servile work on Sunday.", grave: false },
  ]},
  { num: "IV", title: "Honour Thy Parents", cite: "\"Honour thy father and thy mother.\"", src: "Exodus 20:12", questions: [
    { text: "I was disrespectful or disobedient to parents or lawful superiors.", grave: false },
    { text: "I neglected to care for ageing parents when I was able to do so.", grave: true },
  ]},
  { num: "V", title: "Thou Shalt Not Kill", cite: "\"Thou shalt not kill.\"", src: "Exodus 20:13", questions: [
    { text: "I harbored anger, resentment, or hatred without seeking reconciliation.", grave: false },
    { text: "I caused serious physical harm to another person.", grave: true },
    { text: "I abused alcohol, drugs, or recklessly endangered my health.", grave: false },
  ]},
  { num: "VI", title: "Purity", cite: "\"Thou shalt not commit adultery.\"", src: "Exodus 20:14", questions: [
    { text: "I willfully entertained impure thoughts or desires.", grave: false },
    { text: "I engaged in sexual activity outside of marriage.", grave: true },
    { text: "I used pornography.", grave: true },
  ]},
  { num: "VII", title: "Thou Shalt Not Steal", cite: "\"Thou shalt not steal.\"", src: "Exodus 20:15", questions: [
    { text: "I stole or deliberately damaged another's property.", grave: false },
    { text: "I was dishonest in business or financial matters.", grave: false },
    { text: "I wasted time through sloth when duty called.", grave: false },
  ]},
  { num: "VIII", title: "False Witness", cite: "\"Thou shalt not bear false witness.\"", src: "Exodus 20:16", questions: [
    { text: "I told serious lies that harmed another's reputation.", grave: true },
    { text: "I engaged in gossip, detraction, or calumny.", grave: false },
    { text: "I judged others rashly or uncharitably.", grave: false },
  ]},
  { num: "IX", title: "Purity of Heart", cite: "\"Thou shalt not covet thy neighbour's wife.\"", src: "Exodus 20:17", questions: [
    { text: "I deliberately dwelt on lustful thoughts or fantasies.", grave: false },
    { text: "I placed myself in occasions of sin against purity.", grave: false },
  ]},
  { num: "X", title: "Contentment", cite: "\"Thou shalt not covet thy neighbour's goods.\"", src: "Exodus 20:17", questions: [
    { text: "I was envious of others' possessions, talents, or success.", grave: false },
    { text: "I was ungrateful for the gifts God has given me.", grave: false },
  ]},
];

const DOCTORS = [
  { id: "ambrose", name: "St. Ambrose of Milan", dates: "c. 340–397", order: "Bishop", titleEn: "The Honey-Tongued Doctor", icon: "🐝", era: "Patristic",
    bio: "Roman governor turned bishop overnight — he was elected by popular acclaim while still a catechumen. His preaching converted Augustine. His On the Duties of the Clergy is one of the first treatises on Catholic moral theology, adapting Cicero's framework for Christian life. He fearlessly confronted Emperor Theodosius over the massacre at Thessalonica, establishing the principle that even rulers are subject to moral law.",
    topics: ["Moral Duties","The Sacraments","Repentance","Church & State","Virginity","The Clergy"],
    works: [
      { title: "On the Duties of the Clergy", url: "https://www.newadvent.org/fathers/34021.htm" },
      { title: "On the Mysteries", url: "https://www.newadvent.org/fathers/3405.htm" },
      { title: "On Repentance", url: "https://www.newadvent.org/fathers/3407.htm" },
    ],
    quotes: [
      { text: "When in Rome, live as the Romans do; when elsewhere, live as they live elsewhere.", source: "Advice to Augustine (via Letter 54)" },
      { text: "No one heals himself by wounding another.", source: "On the Duties of the Clergy" },
    ] },
  { id: "jerome", name: "St. Jerome", dates: "c. 342–420", order: "Priest & Hermit", titleEn: "The Greatest Doctor", icon: "📜", era: "Patristic",
    bio: "The foremost Scripture scholar of the early Church. Mastering Hebrew, Greek, and Latin, Jerome produced the Vulgate — the Latin translation of the Bible that served as the Church's standard text for over a millennium. His commentaries on the prophets and his fierce polemical letters made him the most formidable intellect of the patristic age. Known for his sharp temper and sharper pen.",
    topics: ["Scripture","Translation","Asceticism","Monasticism","Polemics"],
    works: [
      { title: "The Vulgate (Latin Bible)", url: null },
      { title: "Commentaries on Scripture", url: "https://www.newadvent.org/fathers/30.htm" },
      { title: "Letters", url: "https://www.newadvent.org/fathers/30.htm" },
    ],
    quotes: [
      { text: "Ignorance of Scripture is ignorance of Christ.", source: "Commentary on Isaiah" },
      { text: "Good, better, best. Never let it rest. Till your good is better and your better is best.", source: "Letters" },
    ] },
  { id: "chrysostom", name: "St. John Chrysostom", dates: "c. 349–407", order: "Archbishop of Constantinople", titleEn: "The Golden Mouth", icon: "🗣", era: "Patristic",
    bio: "The greatest preacher in the history of the Church — 'Chrysostom' means 'Golden Mouth.' His homilies on Matthew, Romans, and Genesis are unmatched for their combination of doctrinal depth and practical moral application. As Archbishop of Constantinople he fearlessly denounced the luxury of the imperial court, which led to his exile and death. His writings on marriage, wealth, anger, and the duties of daily life make him especially relevant for moral guidance.",
    topics: ["Preaching","Marriage","Wealth & Poverty","The Eucharist","Anger","Daily Moral Life","The Priesthood"],
    works: [
      { title: "Homilies on Matthew", url: "https://www.newadvent.org/fathers/200101.htm" },
      { title: "On the Priesthood", url: "https://www.newadvent.org/fathers/1901.htm" },
      { title: "On Marriage and Family Life", url: "https://www.newadvent.org/fathers/2002.htm" },
    ],
    quotes: [
      { text: "Not to share our own wealth with the poor is theft from the poor and deprivation of their means of life.", source: "Homily on Lazarus" },
      { text: "Faithfulness in little things is a big thing.", source: "Homilies on Matthew" },
    ] },
  { id: "augustine", name: "St. Augustine of Hippo", dates: "354–430", order: "Bishop", titleEn: "The Doctor of Grace", icon: "❤️‍🔥", era: "Patristic",
    bio: "Born in North Africa to a pagan father and St. Monica, Augustine spent his youth in Manichaeism and philosophical searching before his dramatic conversion at age 31. His Confessions is the first great spiritual autobiography. His writings on grace, original sin, free will, the Trinity, and the just war shaped the entire Western intellectual tradition. No Father of the Church has been quoted more by subsequent councils and popes.",
    topics: ["Grace","Free Will","Original Sin","Love","Confession","Just War","The Trinity","The City of God"],
    works: [
      { title: "Confessions", url: "https://www.newadvent.org/fathers/1101.htm" },
      { title: "City of God", url: "https://www.newadvent.org/fathers/1201.htm" },
      { title: "On the Trinity", url: "https://www.newadvent.org/fathers/1301.htm" },
    ],
    quotes: [
      { text: "Our hearts are restless until they rest in Thee.", source: "Confessions · Book I" },
      { text: "Late have I loved Thee, O Beauty ever ancient, ever new! Late have I loved Thee!", source: "Confessions · Book X" },
      { text: "Love, and do what you will. If you are silent, be silent out of love. If you cry out, cry out from love.", source: "Homily 7 on 1 John" },
    ] },
  { id: "gregory", name: "St. Gregory the Great", dates: "c. 540–604", order: "Pope", titleEn: "The Father of Christian Worship", icon: "⛪", era: "Patristic",
    bio: "The last of the four great Latin Fathers. As pope, he reformed the liturgy (Gregorian Chant bears his name), sent missionaries to England, and wrote Pastoral Care — essentially a manual for how to counsel different kinds of people through different moral situations. His Moralia in Job is the longest patristic commentary on any book of Scripture. He is perhaps the most practically useful Doctor for a moral guidance app.",
    topics: ["Pastoral Counsel","The Moral Life","Humility","Leadership","Liturgy","Spiritual Direction"],
    works: [
      { title: "Pastoral Care (Regula Pastoralis)", url: "https://www.newadvent.org/fathers/36011.htm" },
      { title: "Moralia in Job", url: "https://www.newadvent.org/fathers/36.htm" },
      { title: "Dialogues", url: "https://www.newadvent.org/fathers/3604.htm" },
    ],
    quotes: [
      { text: "The proof of love is in the works. Where love exists, it works great things. But when it ceases to act, it ceases to exist.", source: "Moralia in Job" },
      { text: "The ruler should be a near neighbor to every one in sympathy, and exalted above all in contemplation.", source: "Pastoral Care, Part II" },
    ] },
  { id: "bernard", name: "St. Bernard of Clairvaux", dates: "1090–1153", order: "Cistercian", titleEn: "The Mellifluous Doctor", icon: "🍯", era: "Medieval",
    bio: "The most influential churchman of the 12th century. Bernard founded 68 monasteries, preached the Second Crusade, helped resolve a papal schism, and wrote mystical theology of extraordinary beauty. His sermons on the Song of Songs are the high point of medieval devotional literature. Dante chose him as the final guide in the Paradiso. His devotion to the Blessed Virgin shaped Marian piety for centuries.",
    topics: ["Love of God","Mystical Union","The Blessed Virgin","Monastic Life","Humility","The Song of Songs"],
    works: [
      { title: "On Loving God", url: "https://www.newadvent.org/fathers/3804.htm" },
      { title: "Sermons on the Song of Songs", url: "https://www.newadvent.org/fathers/3805.htm" },
      { title: "On Consideration", url: null },
    ],
    quotes: [
      { text: "You wish to see; listen. Hearing is a step toward vision.", source: "Sermons on the Song of Songs" },
      { text: "In the fullness of time, the fullness of the Godhead came. It came in the flesh so that flesh could see it.", source: "Sermon on the Advent" },
    ] },
  { id: "bonaventure", name: "St. Bonaventure", dates: "1221–1274", order: "Franciscan", titleEn: "The Seraphic Doctor", icon: "🔥", era: "Medieval",
    bio: "A contemporary of Aquinas and his great intellectual counterpart. While Aquinas built on Aristotle, Bonaventure built on Plato and Augustine, producing a mystical theology that sees all creation as a journey back to God. His Mind's Road to God is the summit of the Franciscan intellectual tradition. He served as Minister General of the Franciscan Order and was made a cardinal.",
    topics: ["Mystical Theology","Journey to God","Christ the Center","Contemplation","Franciscan Spirituality"],
    works: [
      { title: "The Mind's Road to God", url: "https://www.ewtn.com/catholicism/library/minds-road-to-god-11357" },
      { title: "Breviloquium", url: "https://www.franciscan-archive.org/bonaventura/opera/breviloquium.html" },
      { title: "The Tree of Life", url: "https://www.ewtn.com/catholicism/library/tree-of-life-11356" },
    ],
    quotes: [
      { text: "If you wish to know, ask grace not instruction, desire not understanding, the groaning of prayer not diligent reading.", source: "Mind's Road to God · Ch. 7" },
    ] },
  { id: "aquinas", name: "St. Thomas Aquinas", dates: "1225–1274", order: "Dominican", titleEn: "The Angelic Doctor", icon: "🏛", era: "Medieval",
    bio: "The greatest systematic theologian in the history of the Church. Aquinas synthesized Aristotelian philosophy with Catholic theology, producing the Summa Theologiae — the most comprehensive treatment of faith and reason ever written. His account of natural law, the virtues, the moral act, and conscience remains the foundation of Catholic moral theology. Declared Doctor of the Church by Pius V and patron of Catholic schools by Leo XIII.",
    topics: ["Conscience","Natural Law","Virtue","Justice","Life & Death","Prayer","The Moral Act","Grace"],
    works: [
      { title: "Summa Theologiae", url: "https://www.newadvent.org/summa/" },
      { title: "Summa Contra Gentiles", url: "https://www.newadvent.org/summa/" },
      { title: "De Malo (On Evil)", url: "https://www.newadvent.org/summa/" },
    ],
    quotes: [
      { text: "Charity is friendship with God — the form and mother of all virtues, without which faith itself is dead.", source: "Summa II-II, Q.23" },
      { text: "Three things are necessary for the salvation of man: to know what he ought to believe, to know what he ought to desire, and to know what he ought to do.", source: "Two Precepts of Charity" },
      { text: "To one who has faith, no explanation is necessary. To one without faith, no explanation is possible.", source: "Attributed" },
    ] },
  { id: "catherine", name: "St. Catherine of Siena", dates: "1347–1380", order: "Dominican Tertiary", titleEn: "The Mystic of Fire", icon: "🔥", era: "Medieval",
    bio: "An illiterate laywoman who became one of the most influential figures in Church history. She persuaded Pope Gregory XI to return from Avignon to Rome, ending the Babylonian Captivity. Her Dialogue, dictated in ecstasy, is a masterpiece of mystical theology. She is one of only four women declared a Doctor of the Church and a patron saint of Europe.",
    topics: ["Obedience","The Papacy","The Blood of Christ","Suffering","Mystical Union","Reform"],
    works: [
      { title: "Dialogue of Divine Providence", url: null },
      { title: "Letters", url: null },
    ],
    quotes: [
      { text: "Nails were not enough to hold God-and-man nailed and fastened on the Cross, had not love held Him there.", source: "Dialogue" },
      { text: "Be who God meant you to be and you will set the world on fire.", source: "Attributed" },
    ] },
  { id: "teresa", name: "St. Teresa of Ávila", dates: "1515–1582", order: "Carmelite", titleEn: "The Doctor of Prayer", icon: "🕊", era: "Early Modern",
    bio: "A Spanish mystic who reformed the Carmelite order and wrote the definitive Catholic account of contemplative prayer. Her Interior Castle maps the soul's journey through seven mansions toward union with God. Practical, witty, and unflinching, Teresa combined mystical heights with down-to-earth counsel. The first woman declared a Doctor of the Church (1970).",
    topics: ["Prayer","Contemplation","Interior Life","Reform","Obedience","Humility"],
    works: [
      { title: "Interior Castle", url: "https://www.ccel.org/ccel/teresa/castle2.html" },
      { title: "Way of Perfection", url: null },
      { title: "The Life of Teresa of Jesus (Autobiography)", url: null },
    ],
    quotes: [
      { text: "Let nothing disturb you, let nothing frighten you. All things are passing; God never changes. Patience obtains all things.", source: "Bookmark prayer" },
      { text: "Christ has no body now but yours. No hands, no feet on earth but yours.", source: "Attributed" },
    ] },
  { id: "johnofthecross", name: "St. John of the Cross", dates: "1542–1591", order: "Carmelite", titleEn: "The Mystical Doctor", icon: "🌑", era: "Early Modern",
    bio: "A Spanish priest and mystic who, with Teresa of Ávila, reformed the Carmelite order. Imprisoned by his own brethren for his reform efforts, he wrote some of the greatest mystical poetry in any language. His Dark Night of the Soul describes the purification the soul must undergo to reach union with God — a concept that has shaped Catholic spiritual direction for four centuries.",
    topics: ["Dark Night","Purification","Union with God","Detachment","Contemplation","Suffering"],
    works: [
      { title: "Dark Night of the Soul", url: "https://www.ccel.org/ccel/john_cross/dark_night.html" },
      { title: "Ascent of Mount Carmel", url: null },
      { title: "Spiritual Canticle", url: null },
    ],
    quotes: [
      { text: "In the evening of life, we will be judged on love alone.", source: "Sayings of Light and Love" },
      { text: "Where there is no love, put love — and you will find love.", source: "Letters" },
    ] },
  { id: "bellarmine", name: "St. Robert Bellarmine", dates: "1542–1621", order: "Jesuit", titleEn: "The Hammer of Heretics", icon: "🛡", era: "Early Modern",
    bio: "The foremost controversialist of the Counter-Reformation. His Disputationes is the most systematic defense of Catholic doctrine against Protestant objections ever written. He served as a cardinal, papal theologian, and spiritual director to St. Aloysius Gonzaga. His Art of Dying Well remains a classic of Catholic spirituality on the last things.",
    topics: ["Apologetics","Papal Authority","The Sacraments","The Last Things","Controversy","The Church"],
    works: [
      { title: "De Controversiis (Disputations)", url: "https://www.newadvent.org/cathen/02411d.htm" },
      { title: "The Art of Dying Well", url: "https://www.ewtn.com/catholicism/library/art-of-dying-well-12498" },
    ],
    quotes: [
      { text: "The school of Christ is the school of charity. On the last day, when the great general examination takes place, there will be no question at all on the text of Aristotle, the aphorisms of Hippocrates, or the paragraphs of Justinian. Charity will be the whole syllabus.", source: "De Gemitu Columbae" },
    ] },
  { id: "desales", name: "St. Francis de Sales", dates: "1567–1622", order: "Bishop of Geneva", titleEn: "The Gentleman Saint", icon: "💜", era: "Early Modern",
    bio: "Bishop of Geneva during the Reformation, Francis proved that holiness is for everyone — not only monks and nuns. His Introduction to the Devout Life democratized the spiritual life, teaching merchants, soldiers, and married people how to pursue sanctity in daily work. His gentleness in controversy won back thousands from Calvinism. Patron of writers and the Catholic press.",
    topics: ["Devout Life","Spiritual Direction","Gentleness","Love of God","Marriage","Patience"],
    works: [
      { title: "Introduction to the Devout Life", url: "https://www.ccel.org/ccel/desales/devout_life.html" },
      { title: "Treatise on the Love of God", url: null },
      { title: "Letters of Spiritual Direction", url: null },
    ],
    quotes: [
      { text: "Nothing is so strong as gentleness, nothing so gentle as real strength.", source: "Letters of Spiritual Direction" },
      { text: "Have patience with all things, but chiefly have patience with yourself.", source: "Introduction to the Devout Life" },
      { text: "Do not wish to be anything but what you are, and try to be that perfectly.", source: "Introduction to the Devout Life" },
    ] },
  { id: "liguori", name: "St. Alphonsus Liguori", dates: "1696–1787", order: "Redemptorist", titleEn: "The Most Zealous Doctor", icon: "✝", era: "Early Modern",
    bio: "A Neapolitan nobleman who became a priest, bishop, and founder of the Redemptorist order. He developed a moral theology that charted a middle course between rigorism and laxism, earning him the title Patron of Moral Theologians and Confessors. His probabilist approach — that in doubtful cases the opinion favorable to liberty may be followed if solidly probable — transformed the practice of confession and pastoral care across the Catholic world.",
    topics: ["Moral Theology","Confession","Prayer","Mercy","The Blessed Virgin","Probabilism"],
    works: [
      { title: "Moral Theology", url: null },
      { title: "The Glories of Mary", url: null },
      { title: "The Practice of the Love of Jesus Christ", url: null },
    ],
    quotes: [
      { text: "He who trusts himself is lost. He who trusts in God can do all things.", source: "The Practice of the Love of Jesus Christ" },
      { text: "In doubtful matters, the more favorable opinion to the liberty of the person may be followed, provided it has solid probability.", source: "Moral Theology, Book I" },
    ] },
  { id: "therese", name: "St. Thérèse of Lisieux", dates: "1873–1897", order: "Carmelite", titleEn: "The Little Flower", icon: "🌹", era: "Modern",
    bio: "The youngest Doctor of the Church, who died at 24 and yet articulated one of the most profound spiritual insights in Catholic history: the 'Little Way.' Rather than heroic penances or mystical visions, Thérèse taught that sanctity consists in doing small things with great love and total trust in God's mercy. Her autobiography Story of a Soul has been translated into over 60 languages and has guided countless souls — including missionaries, soldiers, and popes — toward confidence in God's fatherly love. Patron of the missions.",
    topics: ["The Little Way","Trust","Suffering","Love","Humility","Confidence in God's Mercy","Spiritual Childhood"],
    works: [
      { title: "Story of a Soul (Autobiography)", url: null },
      { title: "Letters", url: null },
      { title: "Last Conversations", url: null },
    ],
    quotes: [
      { text: "My vocation is love! In the heart of the Church, my Mother, I will be love.", source: "Manuscript B" },
      { text: "Miss no single opportunity of making some small sacrifice, here by a smiling look, there by a kindly word; always doing the smallest right and doing it all for love.", source: "Story of a Soul" },
      { text: "The only way I can prove my love is by scattering flowers, and these flowers are every little sacrifice, every glance and word, and the doing of the least actions for love.", source: "Story of a Soul" },
    ] }
];

const ACT_OF_CONTRITION = "O my God, I am heartily sorry for having offended Thee, and I detest all my sins because of Thy just punishments, but most of all because they offend Thee, my God, Who art all good and deserving of all my love. I firmly resolve, with the help of Thy grace, to sin no more and to avoid the near occasions of sin. Amen.";

const ACT_OF_CONTRITION_CHILD = "O my God, I am sorry for all my sins. I know I have not been kind and good the way You want me to be. I am sorry because You love me so much and I want to love You back. Please forgive me, and help me to be good. Amen.";

// ═══════════════════════════════════════════════════════════════════
// STATIONS OF THE CROSS — DATA
// ═══════════════════════════════════════════════════════════════════
const ST_TITLES = ["Jesus Is Condemned to Death","Jesus Takes Up His Cross","Jesus Falls the First Time","Jesus Meets His Mother","Simon Helps Jesus Carry the Cross","Veronica Wipes the Face of Jesus","Jesus Falls the Second Time","Jesus Meets the Women of Jerusalem","Jesus Falls the Third Time","Jesus Is Stripped of His Garments","Jesus Is Nailed to the Cross","Jesus Dies on the Cross","Jesus Is Taken Down from the Cross","Jesus Is Laid in the Tomb"];

// Station artwork — mostly James Tissot (1836–1902), Brooklyn Museum. Public domain.
// Stations 7, 9, 11 replaced with other masters for better subject match.
const ST_IMGS = [
  /* 1  Condemned    */ "/images/station-01.jpg",
  /* 2  Takes Cross  */ "/images/station-02.jpg",
  /* 3  Falls 1st    */ "/images/station-03.jpg",
  /* 4  Meets Mother */ "/images/station-04.jpg",
  /* 5  Simon       */ "/images/station-05.jpg",
  /* 6  Veronica    */ "/images/station-06.jpg",
  /* 7  Falls 2nd   */ "/images/station-07.jpg",  // Raphael, Lo Spasimo
  /* 8  Women Jerus */ "/images/station-08.jpg",
  /* 9  Falls 3rd   */ "/images/station-09.jpg",  // Titian
  /* 10 Stripped    */ "/images/station-10.jpg",
  /* 11 Nailed      */ "/images/station-11.jpg",  // Rubens
  /* 12 Dies        */ "/images/station-12.jpg",
  /* 13 Taken Down  */ "/images/station-13.jpg",
  /* 14 Laid in Tomb*/ "/images/station-14.jpg",
];
const ST_CREDITS = [
  "James Tissot · Brooklyn Museum","James Tissot · Brooklyn Museum","James Tissot · Brooklyn Museum",
  "James Tissot · Brooklyn Museum","James Tissot · Brooklyn Museum","James Tissot · Brooklyn Museum",
  "Raphael (c. 1516) · Museo del Prado","James Tissot · Brooklyn Museum",
  "Titian (c. 1565) · Museo del Prado","James Tissot · Brooklyn Museum",
  "Peter Paul Rubens (1610) · Antwerp","James Tissot · Brooklyn Museum",
  "James Tissot · Brooklyn Museum","James Tissot · Brooklyn Museum",
];
const STABAT = ["Through her heart, His sorrow sharing,\nAll His bitter anguish bearing,\nNow at length the sword had passed.","O, how sad and sore distressed\nWas that Mother, highly blest,\nOf the sole begotten One!","Christ above in torment hangs:\nShe beneath beholds the pangs\nOf her dying glorious Son.","Is there one who would not weep,\nWhelmed in miseries so deep,\nChrist's dear Mother to behold?","Can the human heart refrain\nFrom partaking in her pain,\nIn that Mother's pain untold?","Bruised, derided, cursed, defiled,\nShe beheld her tender Child,\nAll with bloody scourges rent.","For the sins of His own nation,\nSaw Him hang in desolation\nTill His spirit forth He sent.","O thou Mother, font of love!\nTouch my spirit from above,\nMake my heart with thine accord.","Make me feel as thou hast felt;\nMake my soul to glow and melt,\nWith the love of Christ my Lord.","Holy Mother, pierce me through;\nIn my heart each wound renew\nOf my Savior crucified.","Let me share with thee His pain,\nWho for all my sins was slain,\nWho for me in torment died.","Let me mingle tears with thee,\nMourning Him who mourned for me,\nAll the days that I may live.","By the cross with thee to stay;\nThere with thee to weep and pray\nIs all I ask of thee to give.","Virgin of all virgins best,\nListen to my fond request:\nLet me share thy grief divine."];
const ST_VERSICLE = { v: "We adore Thee, O Christ, and we praise Thee.", r: "Because by Thy holy Cross, Thou hast redeemed the world." };
const ST_COLORS = [["#1a2744","#2a3a5c"],["#1a2744","#2d3f5e"],["#1e2b48","#2a3a5c"],["#1a2744","#34486a"],["#1e2b48","#2d3f5e"],["#1a2744","#2a3a5c"],["#1e2b48","#2a3a5c"],["#1a2744","#34486a"],["#1e2b48","#2d3f5e"],["#3a1818","#5c2020"],["#3a1818","#5c2020"],["#1a1a2e","#2a2a44"],["#1a2744","#2d3f5e"],["#1a2744","#2a3a5c"]];
const ST_SYMBOLS = [
  '<circle cx="50" cy="30" r="12" fill="none" stroke="#d4a843" stroke-width="1.5"/><line x1="50" y1="42" x2="50" y2="70" stroke="#d4a843" stroke-width="1.5"/><line x1="30" y1="55" x2="70" y2="50" stroke="#d4a843" stroke-width="1.5"/><path d="M25,60 Q30,70 35,60" fill="none" stroke="#d4a843" stroke-width="1.2"/><path d="M65,55 Q70,65 75,55" fill="none" stroke="#d4a843" stroke-width="1.2"/>',
  '<line x1="50" y1="20" x2="50" y2="80" stroke="#d4a843" stroke-width="2.5"/><line x1="35" y1="35" x2="65" y2="35" stroke="#d4a843" stroke-width="2.5"/><circle cx="50" cy="15" r="5" fill="none" stroke="#d4a843" stroke-width="1.2"/>',
  '<line x1="35" y1="30" x2="55" y2="70" stroke="#d4a843" stroke-width="2.5"/><line x1="30" y1="45" x2="60" y2="45" stroke="#d4a843" stroke-width="2"/><path d="M50,70 Q55,80 65,75" fill="none" stroke="#d4a843" stroke-width="1.5"/>',
  '<path d="M35,40 C35,30 50,30 50,42 C50,30 65,30 65,42 C65,55 50,65 50,65 C50,65 35,55 35,40Z" fill="none" stroke="#d4a843" stroke-width="1.5"/><circle cx="35" cy="35" r="3" fill="#d4a843" opacity="0.5"/><circle cx="65" cy="35" r="3" fill="#d4a843" opacity="0.5"/>',
  '<line x1="50" y1="25" x2="50" y2="75" stroke="#d4a843" stroke-width="2"/><line x1="38" y1="38" x2="62" y2="38" stroke="#d4a843" stroke-width="2"/><circle cx="38" cy="30" r="5" fill="none" stroke="#d4a843" stroke-width="1.2"/><circle cx="62" cy="30" r="5" fill="none" stroke="#d4a843" stroke-width="1.2"/>',
  '<rect x="30" y="28" width="40" height="44" rx="3" fill="none" stroke="#d4a843" stroke-width="1.5"/><circle cx="50" cy="45" r="10" fill="none" stroke="#d4a843" stroke-width="1.2"/><line x1="45" y1="42" x2="47" y2="42" stroke="#d4a843" stroke-width="1"/><line x1="53" y1="42" x2="55" y2="42" stroke="#d4a843" stroke-width="1"/><path d="M45,50 Q50,54 55,50" fill="none" stroke="#d4a843" stroke-width="1"/>',
  '<line x1="30" y1="35" x2="55" y2="68" stroke="#d4a843" stroke-width="2.5"/><line x1="25" y1="50" x2="55" y2="45" stroke="#d4a843" stroke-width="2"/><path d="M55,68 Q60,78 70,72" fill="none" stroke="#d4a843" stroke-width="1.5"/>',
  '<path d="M30,50 Q50,30 70,50" fill="none" stroke="#d4a843" stroke-width="1.5"/><circle cx="40" cy="64" r="2" fill="#d4a843" opacity="0.5"/><circle cx="52" cy="57" r="2" fill="#d4a843" opacity="0.5"/><circle cx="64" cy="64" r="2" fill="#d4a843" opacity="0.5"/>',
  '<line x1="25" y1="40" x2="55" y2="72" stroke="#d4a843" stroke-width="2.5"/><line x1="20" y1="55" x2="50" y2="50" stroke="#d4a843" stroke-width="2"/><circle cx="55" cy="72" r="3" fill="#d4a843" opacity="0.3"/>',
  '<path d="M35,30 L45,30 L50,50 L55,30 L65,30 L58,55 L65,80 L50,65 L35,80 L42,55Z" fill="none" stroke="#d4a843" stroke-width="1.5"/>',
  '<line x1="50" y1="20" x2="50" y2="80" stroke="#d4a843" stroke-width="2.5"/><line x1="30" y1="40" x2="70" y2="40" stroke="#d4a843" stroke-width="2.5"/><circle cx="30" cy="40" r="3" fill="#d4a843"/><circle cx="70" cy="40" r="3" fill="#d4a843"/><circle cx="50" cy="72" r="3" fill="#d4a843"/>',
  '<line x1="50" y1="15" x2="50" y2="85" stroke="#d4a843" stroke-width="3"/><line x1="28" y1="38" x2="72" y2="38" stroke="#d4a843" stroke-width="3"/><line x1="50" y1="38" x2="30" y2="20" stroke="#d4a843" stroke-width="0.8" opacity="0.5"/><line x1="50" y1="38" x2="70" y2="20" stroke="#d4a843" stroke-width="0.8" opacity="0.5"/>',
  '<path d="M35,70 Q35,45 50,40 Q55,38 55,45 L55,65" fill="none" stroke="#d4a843" stroke-width="1.5"/><circle cx="50" cy="35" r="5" fill="none" stroke="#d4a843" stroke-width="1.2"/><line x1="55" y1="65" x2="70" y2="60" stroke="#d4a843" stroke-width="1.2"/>',
  '<rect x="28" y="40" width="44" height="35" rx="3" fill="none" stroke="#d4a843" stroke-width="1.5"/><path d="M28,40 Q50,25 72,40" fill="none" stroke="#d4a843" stroke-width="1.5"/><circle cx="50" cy="57" r="10" fill="none" stroke="#d4a843" stroke-width="2"/><line x1="50" y1="47" x2="50" y2="67" stroke="#d4a843" stroke-width="1.5"/><line x1="40" y1="57" x2="60" y2="57" stroke="#d4a843" stroke-width="1.5"/>'
];
const AL_OP = "My Lord Jesus Christ, Thou hast made this journey to die for me with love unutterable, and I have so many times unworthily abandoned Thee; but now I love Thee with my whole heart, and because I love Thee, I repent sincerely for ever having offended Thee. Pardon me, my God, and permit me to accompany Thee on this journey. Thou goest to die for love of me; I wish also, my beloved Redeemer, to die for love of Thee. My Jesus, I will live and die always united to Thee.";
const AL_ST = [
  { m: "Consider how Jesus Christ, after being scourged and crowned with thorns, was unjustly condemned by Pilate to die on the cross.", p: "My adorable Jesus, it was not Pilate; no, it was my sins that condemned Thee to die. I beseech Thee, by the merits of this sorrowful journey, to assist my soul on its journey to eternity. I love Thee, beloved Jesus; I love Thee more than I love myself. With all my heart I repent of ever having offended Thee. Grant that I may love Thee always; and then do with me as Thou wilt." },
  { m: "Consider Jesus as He walked this road with the cross on His shoulders, thinking of us, and offering to His Father in our behalf the death He was about to suffer.", p: "My most beloved Jesus, I embrace all the sufferings Thou hast destined for me until death. I beg Thee, by all Thou suffered in carrying Thy cross, to help me carry mine with Thy perfect peace and resignation. I love Thee, Jesus, my love; I repent of ever having offended Thee. Never let me separate myself from Thee again. Grant that I may love Thee always; and then do with me as Thou wilt." },
  { m: "Consider the first fall of Jesus. Loss of blood from the scourging and crowning with thorns had so weakened Him that He could hardly walk; and yet He had to carry that great load upon His shoulders. As the soldiers struck Him cruelly, He fell several times under the heavy cross.", p: "My beloved Jesus, it was not the weight of the cross but the weight of my sins which made Thee suffer so much. By the merits of this first fall, save me from falling into mortal sin. I love Thee, O my Jesus, with all my heart; I am sorry that I have offended Thee. May I never offend Thee again. Grant that I may love Thee always; and then do with me as Thou wilt." },
  { m: "Consider how the Son met His Mother on His way to Calvary. Jesus and Mary gazed at each other and their looks became as so many arrows to wound those hearts which loved each other so tenderly.", p: "My most loving Jesus, by the pain Thou suffered in this meeting, grant me the grace of being truly devoted to Thy most holy Mother. And Thou, my Queen, who was overwhelmed with sorrow, obtain for me by thy prayers a tender and a lasting remembrance of the passion of thy divine Son. I love Thee, Jesus, my Love, above all things. I repent of ever having offended Thee. Grant that I may love Thee always; and then do with me as Thou wilt." },
  { m: "Consider how weak and weary Jesus was. At each step He was at the point of expiring. Fearing that He would die on the way when they wished Him to die the infamous death of the cross, they forced Simon of Cyrene to help carry the cross after Our Lord.", p: "My beloved Jesus, I will not refuse the cross as Simon did: I accept it and embrace it. I accept in particular the death that is destined for me with all the pains that may accompany it. I unite it to Thy death and I offer it to Thee. Thou hast died for love of me; I will die for love of Thee and to please Thee. Help me by Thy grace. I love Thee, Jesus, my Love; I repent of ever having offended Thee. Grant that I may love Thee always; and then do with me as Thou wilt." },
  { m: "Consider the compassion of the holy woman, Veronica. Seeing Jesus in such distress, His face bathed in sweat and blood, she presented Him with her veil. Jesus wiped His face, and left upon the cloth the image of His sacred countenance.", p: "My beloved Jesus, Thy face was beautiful before Thou began this journey; but now it no longer appears beautiful and is disfigured with wounds and blood. Alas, my soul also was once beautiful when it received Thy grace in Baptism; but I have since disfigured it with my sins. Thou alone, my Redeemer, canst restore it to its former beauty. Do this by the merits of Thy passion; and then do with me as Thou wilt." },
  { m: "Consider how the second fall of Jesus under His cross renews the pain in all the wounds of the head and members of our afflicted Lord.", p: "My most gentle Jesus, how many times Thou hast forgiven me; and how many times I have fallen again and begun again to offend Thee! By the merits of this second fall, give me the grace to persevere in Thy love until death. Grant that in all my temptations I may always have recourse to Thee. I love Thee, Jesus, my Love, with all my heart; I am sorry that I have offended Thee. Grant that I may love Thee always; and then do with me as Thou wilt." },
  { m: "Consider how the women wept with compassion seeing Jesus so distressed and dripping with blood as He walked along. Jesus said to them, \"Weep not so much for Me, but rather for yourselves and for your children.\"", p: "My Jesus, laden with sorrows, I weep for the sins which I have committed against Thee because of the punishment I deserve for them; and still more because of the displeasure they have caused Thee who hast loved me with an infinite love. It is Thy love, more than the fear of hell, which makes me weep for my sins. My Jesus, I love Thee more than myself; I am sorry that I have offended Thee. Grant that I may love Thee always; and then do with me as Thou wilt." },
  { m: "Consider how Jesus Christ fell for the third time. He was extremely weak and the cruelty of His executioners was excessive; they tried to hasten His steps though He hardly had strength to move.", p: "My outraged Jesus, by the weakness Thou suffered in going to Calvary, give me enough strength to overcome all human respect and all my evil passions which have led me to despise Thy friendship. I love Thee, Jesus, my Love, with all my heart; I am sorry for ever having offended Thee. Grant that I may love Thee always; and then do with me as Thou wilt." },
  { m: "Consider how Jesus was violently stripped of His clothes by His executioners. The inner garments adhered to His lacerated flesh and the soldiers tore them off so roughly that the skin came with them.", p: "My innocent Jesus, by the torment Thou suffered in being stripped of Thy garments, help me to strip myself of all attachment for the things of earth that I may place all my love in Thee who art so worthy of my love. I love Thee, O Jesus, with all my heart; I am sorry for ever having offended Thee. Grant that I may love Thee always; and then do with me as Thou wilt." },
  { m: "Consider Jesus, thrown down upon the cross. He stretched out His arms and offered to His eternal Father the sacrifice of His life for our salvation. They nailed His hands and feet, and then, raising the cross, left Him to die in anguish.", p: "My despised Jesus, nail my heart to the cross that it may always remain there to love Thee and never leave Thee again. I love Thee more than myself; I am sorry for ever having offended Thee. Grant that I may love Thee always; and then do with me as Thou wilt." },
  { m: "Consider how thy Jesus, after three hours of agony on the cross, is finally overwhelmed with suffering and, abandoning Himself to the weight of His body, bows His head and dies.", p: "My dying Jesus, I devoutly kiss the cross on which Thou would die for love of me. I deserve, because of my sins, to die a terrible death; but Thy death is my hope. By the merits of Thy death, give me the grace to die embracing Thy feet and burning with love of Thee. I yield my soul into Thy hands. I love Thee with my whole heart. I am sorry that I have offended Thee. Grant that I may love Thee always; and then do with me as Thou wilt." },
  { m: "Consider how, after Our Lord had died, He was taken down from the cross by two of His disciples, Joseph and Nicodemus, and placed in the arms of His afflicted Mother. She received Him with unutterable tenderness and pressed Him close to her bosom.", p: "O Mother of Sorrows, for the love of thy Son, accept me as thy servant and pray to Him for me. And Thou, my Redeemer, since Thou hast died for me, allow me to love Thee, for I desire only Thee and nothing more. I love Thee, Jesus my Love, and I am sorry that I have offended Thee. Grant that I may love Thee always; and then do with me as Thou wilt." },
  { m: "Consider how the disciples carried the body of Jesus to its burial, while His holy Mother went with them and arranged it in the sepulcher with her own hands. They then closed the tomb and all departed.", p: "Oh, my buried Jesus, I kiss the stone that closes Thee in. But Thou gloriously didst rise again on the third day. I beg Thee by Thy resurrection that I may be raised gloriously on the last day, to be united with Thee in heaven, to praise Thee and love Thee forever. I love Thee, Jesus, and I repent of ever having offended Thee. Grant that I may love Thee always; and then do with me as Thou wilt." },
];
const AL_CL = "My good and dear Jesus, I kneel before Thee, asking Thee most earnestly to engrave upon my heart a deep and lively faith, hope, and charity, with true repentance for my sins, and a firm resolve to make amends. As I reflect upon Thy five wounds, and dwell upon them with deep compassion and grief, I recall, good Jesus, the words the Prophet David spoke long ago concerning Thyself: \"They pierced My hands and My feet; they have numbered all My bones.\"";
const FR_OP = "Most merciful Lord, with a contrite heart and penitent spirit I bow down before Thy divine Majesty. I adore Thee as my supreme Lord and Master. I believe in Thee, I hope in Thee, I love Thee above all things. I am heartily sorry for having offended Thee, my only and supreme God. I firmly resolve to amend my life; and although I am unworthy to obtain mercy, yet looking upon Thy holy Cross I am filled with peace and consolation.";
const FR_ST = [
  { m: "Jesus, the most innocent of beings, is condemned to death, yes, to the shameful death of the cross. In order to remain a friend of Caesar, Pilate delivers Jesus into the hands of His enemies. O fearful crime, to condemn Innocence to death and to displease God in order to please men.", p: "O innocent Jesus, I have sinned and I am guilty of eternal death; but that I may live, Thou dost gladly accept the unjust sentence of death. For whom then shall I henceforth live if not for Thee, my Lord? If I desire to please men, I cannot be Thy servant. Let me, therefore, rather displease the whole world than not please Thee, O Jesus!" },
  { m: "When our divine Redeemer beheld the Cross, He most willingly reached out to it with His bleeding arms. He embraced it lovingly, kissed it tenderly, took it on His bruised shoulders, and, exhausted as He was, He carried it joyfully.", p: "O my Jesus, I cannot be Thy friend and follower if I refuse to carry my cross. O beloved cross, I embrace thee, I kiss thee, I joyfully accept thee from the hand of my God. Far be it from me to glory in anything save in the Cross of my Lord and Redeemer. By it the world shall be crucified to me, and I to the world, that I may be Thine forever." },
  { m: "Carrying the Cross, our dear Savior was so weakened with its heavy weight that He fell exhausted to the ground. The Cross was light and sweet to Him, but our sins made it so heavy and hard to carry.", p: "Beloved Jesus, Thou didst carry the burden and the heavy weight of my sins. Should I then not bear in union with Thee my light burden of suffering, and accept the sweet yoke of Thy commandments? Thy yoke is sweet and Thy burden is light. I willingly accept it. I will take up my cross and follow Thee." },
  { m: "How sad and how painful must it have been for Mary to behold her beloved Son laden with the Cross, covered with wounds and blood, and driven through the streets by savage executioners! What unspeakable pangs her most tender heart must have experienced!", p: "O Jesus, O Mary, I am the cause of the pains that pierced your hearts. Would that my heart might experience some of your sufferings. O Mother, let me share in thy sufferings and those of thy Son, that I may obtain the grace of a happy death." },
  { m: "Simon of Cyrene was forced to help our exhausted Savior carry His Cross. How pleased would Jesus have been, had Simon offered his services of his own accord.", p: "O Jesus, whosoever does not take up his cross and follow Thee, is not worthy of Thee. Behold, I cheerfully join Thee on the way of the cross. I desire to carry it with all patience until death, that I may prove worthy of Thee." },
  { m: "Moved by compassion, Veronica presents her veil to Jesus, to wipe His disfigured face. He imprints on it His holy countenance, and returns it to her as a recompense.", p: "Dearest Jesus, what return shall I make Thee for all Thy benefits? Behold, I consecrate myself entirely to Thy service. My whole heart I give to Thee; stamp on it Thy holy image, that I may never forget Thee." },
  { m: "Overwhelmed by the weight of the Cross, Jesus falls again to the ground. But the cruel executioners do not permit Him to rest a moment. With thrusts and blows they urge Him onward.", p: "Have mercy on me, O Jesus, and help me never to fall into my former sins. From this moment I will strive sincerely never to sin again. But Thou, O Jesus, strengthen me with Thy grace, that I may faithfully carry out my resolution." },
  { m: "Moved by compassion, these devoted women weep over our suffering Savior. But He turns to them and says: \"Weep not for Me, but weep for yourselves and your children; for they are the cause of My suffering.\"", p: "O Jesus, who shall give my eyes a torrent of tears, that I may day and night weep over my sins? I beseech Thee by Thy bitter and bloody tears to move my heart, so that tears may flow in abundance from my eyes." },
  { m: "Exhausted at the foot of Calvary, Jesus falls for the third time to the ground. How painfully must have been reopened all the wounds of His tender body by these repeated falls.", p: "Most merciful Jesus, I return Thee a thousand thanks for not permitting me to die in my sins. Enkindle in me a sincere desire to amend my life. Let me never again fall into sin, but grant me the grace of final perseverance." },
  { m: "Arriving on Calvary, Jesus was cruelly deprived of His garments. How painful the stripping must have been, because the garments adhered to His mangled body, so that in removing them parts of the flesh were torn away.", p: "Help me, O Jesus, to amend my life. Let it be renewed according to Thy will and desire. However painful the correction may be to me, I will not spare myself. With the assistance of Thy grace, I will refrain from all sinful pleasure, that I may die happy and live forever." },
  { m: "Stripped of His garments, Jesus is violently thrown down on the Cross. His hands and His feet are nailed to it in the most cruel way. Jesus remains silent, because it so pleases His heavenly Father.", p: "O Jesus, meek and patient Lamb, I renounce forever my impatience. Crucify, O Lord, my flesh, with its evil desires and vices. Punish and afflict me in this life, but spare me in the next. I resign myself altogether to Thy holy will." },
  { m: "Behold Jesus crucified! Behold His wounds received for love of you! His whole appearance betokens love. His head is bent to kiss you. His arms are extended to embrace you. His heart is open to receive you.", p: "Most lovable Jesus, who will grant that I may die for love of Thee? Merciful Jesus, take me into Thy wounded heart, that I may despise all perishable things, to live and die for Thee alone." },
  { m: "Jesus did not descend from the Cross, but remained on it till His death. When taken down, He rested on the bosom of His beloved Mother as He had so often done in life.", p: "O Lord Jesus crucified! Help me do what is right and let me not be separated from Thy Cross, for on it I desire to live and to die. Create in me, O Lord, a clean heart, that I may worthily receive Thee in Holy Communion, and that Thou mayest remain in me, and I in Thee, for all eternity." },
  { m: "The body of Jesus is laid in a stranger's tomb. He Who in this world had not whereon to rest His head, would have no grave of His own after death.", p: "O Jesus, Thou hast singled me out from the world, what then shall I seek in it? Thou hast created me for Heaven, what then shall I desire upon earth? Depart from me, deceitful world, with thy vanities! Henceforth I will walk the way of the Cross traced out for me by my Redeemer, and journey onward to my heavenly home." },
];
const FR_CL = "Almighty and eternal God, merciful Father, who hast given to the human race Thy beloved Son as an example of humility, obedience, and patience, to precede us on the way of life, bearing the cross: Graciously grant us that we, inflamed by His infinite love, may take up the sweet yoke of His Gospel together with the mortification of the cross, following Him as His true disciples, so that we shall one day gloriously rise with Him. Amen.";
const RZ_OP = "Lord Jesus Christ, you bore our burdens and continue to carry us. Your journey to the Cross calls us to follow. By the Holy Spirit, rouse our hearts, that as we trace the path of your Passion we may know the power of your suffering and share in its fruit. You who live and reign for ever and ever. Amen.";
const RZ_ST = [
  { s: "Pilate said to them, \u201cThen what should I do with Jesus who is called the Messiah?\u201d All of them said, \u201cLet him be crucified!\u201d So he released Barabbas for them; and after flogging Jesus, he handed him over to be crucified.", sr: "Mt 27:22\u201326", m: "The Judge of the world stands dishonored and defenseless before the earthly judge. Pilate is not utterly evil \u2014 he knows the condemned man is innocent and looks for a way to free him. But his heart is divided, and in the end he lets his own position prevail over what is right. Evil draws its power from indecision and concern for what other people think.", p: "Lord, You were condemned to death because fear of what other people may think suppressed the voice of conscience. So too, throughout history, the innocent have always been maltreated, condemned and killed. Strengthen the quiet voice of our conscience, Your own voice, in our lives. Grant us, ever anew, the grace of conversion." },
  { s: "They stripped him and put a scarlet robe on him, and after twisting some thorns into a crown, they put it on his head.", sr: "Mt 27:28\u201331", m: "Jesus, condemned as an imposter king, is mocked, but this very mockery lays bare a painful truth. How often are the symbols of power borne by the great ones of this world an affront to truth, to justice and to the dignity of man! Jesus, the true King, does not reign through violence, but through a love which suffers for us and with us.", p: "Lord, You willingly subjected Yourself to mockery and scorn. Help us not to ally ourselves with those who look down on the weak and suffering. Help us to acknowledge Your face in the lowly and the outcast. Help us to take up the Cross, and not to shun it." },
  { s: "Surely he has borne our griefs and carried our sorrows; yet we esteemed him stricken, smitten by God. But he was wounded for our transgressions; upon him was the chastisement that made us whole.", sr: "Is 53:4\u20136", m: "In Jesus\u2019 fall, the meaning of His whole life is seen: His voluntary abasement, which lifts us up from the depths of our pride. The humility of Jesus is the surmounting of our pride.", p: "Lord Jesus, the weight of the Cross made You fall to the ground. The weight of our sin, the weight of our pride, brought You down. But Your fall is not a tragedy, or mere human weakness. You came to us when, in our pride, we were laid low. Help us to abandon our destructive pride and, by learning from Your humility, to rise again." },
  { s: "Simon blessed them and said to Mary his mother: \u201cBehold, this child is set for the fall and rising of many in Israel, and for a sign that is spoken against \u2014 and a sword will pierce through your own soul also.\u201d", sr: "Lk 2:34\u201335", m: "She stayed there, with a Mother\u2019s courage, a Mother\u2019s fidelity, a Mother\u2019s goodness, and a faith which did not waver in the hour of darkness.", p: "Holy Mary, Mother of the Lord, you remained faithful when the disciples fled. Teach us to believe, and grant that our faith may bear fruit in courageous service and be the sign of a love ever ready to share suffering and to offer assistance." },
  { s: "As they went out, they came upon a man of Cyrene, Simon by name; this man they compelled to carry his cross.", sr: "Mt 27:32", m: "Simon of Cyrene is on his way home, returning from work, when he comes upon the sad procession. The soldiers force this rugged man to carry the Cross. Yet from this chance encounter, faith was born. Whenever we show kindness to the suffering and defenseless, we help to carry that same Cross of Jesus.", p: "Lord, You opened the eyes and heart of Simon of Cyrene, and You gave him, by his share in Your Cross, the grace of faith. Help us to aid our neighbors in need, even when this interferes with our own plans and desires." },
  { s: "He had no form or comeliness that we should look at him, and no beauty that we should desire him. He was despised and rejected by men.", sr: "Is 53:2\u20133", m: "Veronica embodies the universal yearning to see the face of God. She did not let herself be deterred by the brutality of the soldiers or the fear which gripped the disciples. Only with the heart can we see Jesus. Only love purifies us and gives us the ability to see.", p: "Lord, grant us restless hearts, hearts which seek Your face. Keep us from the blindness of heart which sees only the surface of things. Give us the simplicity and purity which allow us to recognize Your presence in the world." },
  { s: "I am the man who has seen affliction under the rod of his wrath; he has driven and brought me into darkness without any light.", sr: "Lam 3:1\u20132", m: "A Christianity which has grown weary of faith has abandoned the Lord: the great ideologies, and the banal existence of those who, no longer believing in anything, simply drift through life, have built a new and worse paganism. The Lord bears this burden and falls, over and over again, in order to meet us.", p: "Lord Jesus Christ, You have borne all our burdens and You continue to carry us. Lift us up, for by ourselves we cannot rise from the dust. Free us from the bonds of lust. In place of a heart of stone, give us a heart of flesh, a heart capable of seeing." },
  { s: "Jesus turning to them said, \u201cDaughters of Jerusalem, do not weep for me, but weep for yourselves and for your children.\u201d", sr: "Lk 23:28\u201331", m: "Are they not directed at a piety which is purely sentimental, one which fails to lead to conversion and living faith? Before the image of the suffering Lord, evil can no longer be trivialized.", p: "Lord, to the weeping women You spoke of repentance and the Day of Judgment. Convert us and give us new life. Grant that in the end we will not be dry wood, but living branches in You, the true vine, bearing fruit for eternal life." },
  { s: "It is good for a man that he bear the yoke in his youth. Let him sit alone in silence when he has laid it on him.", sr: "Lam 3:27\u201332", m: "How much filth there is in the Church, and even among those who, in the priesthood, ought to belong entirely to Him! How much pride, how much self-complacency! His betrayal by His disciples, their unworthy reception of His Body and Blood, is certainly the greatest suffering endured by the Redeemer.", p: "Lord, Your Church often seems like a boat about to sink, a boat taking in water on every side. Yet it is we ourselves who have soiled them! It is we who betray You time and time again. Have mercy on Your Church. Save and sanctify Your Church. Save and sanctify us all." },
  { s: "They offered him wine mingled with gall, but when he tasted it, he would not drink it. And when they had crucified him, they divided his garments among them by casting lots.", sr: "Mt 27:33\u201336", m: "The moment of the stripping reminds us of the expulsion from Paradise: God\u2019s splendor has fallen away from man. The Lord passes through all the stages of man\u2019s fall from grace, yet each of these steps, for all its bitterness, becomes a step towards our redemption.", p: "Lord Jesus, You were stripped of Your garments, exposed to shame, cast out of society. You took upon Yourself the shame of Adam, and You healed it. Give us a profound respect for man at every stage of his existence. Clothe us in the light of Your grace." },
  { s: "Over his head they put the charge: \u201cThis is Jesus the King of the Jews.\u201d Those who passed by derided him: \u201cHe saved others; he cannot save himself.\u201d", sr: "Mt 27:37\u201342", m: "Jesus is nailed to the Cross. He does not drink the numbing gall offered to Him: He deliberately takes upon Himself all the pain of the Crucifixion. Let us halt before this image of pain, and realize that it is then that we are closest to God.", p: "Lord Jesus Christ, You let Yourself be nailed to the Cross, accepting the terrible cruelty of this suffering. May we never flee from what we are called to do. Help us to remain faithful to You. Help us to accept Your \u201cbinding\u201d freedom, and, bound fast to You, to discover true freedom." },
  { s: "About the ninth hour Jesus cried with a loud voice, \u201cMy God, my God, why have you forsaken me?\u201d And Jesus cried again with a loud voice and yielded up his spirit.", sr: "Mt 27:45\u201350", m: "He takes to Himself the whole suffering people of Israel, all of suffering humanity, the drama of God\u2019s darkness, and He makes God present in the very place where He seems definitively vanquished and absent. From the Cross He triumphs \u2014 ever anew.", p: "Lord Jesus Christ, at the hour of Your death the sun was darkened. Ever anew You are being nailed to the Cross. Help us to recognize Your face at this hour of darkness. Reveal to us Your salvation." },
  { s: "When the centurion and those who were with him saw the earthquake and what took place, they were filled with awe, and said, \u201cTruly this was the Son of God!\u201d", sr: "Mt 27:54\u201355", m: "At Jesus\u2019 burial, the cemetery becomes a garden, the garden from which Adam was cast out. In this hour of immense grief, the light of hope is mysteriously present. The hidden God continues to be the God of life, ever near.", p: "Lord, You descended into the darkness of death. But Your body is placed in good hands and wrapped in a white shroud. Faith has not completely died; the sun has not completely set. Help us not to leave You alone. Give us the fidelity to withstand moments of confusion and a love ready to embrace You in Your utter helplessness." },
  { s: "Joseph took the body, and wrapped it in a clean linen shroud, and laid it in his own new tomb, which he had hewn in the rock.", sr: "Mt 27:59\u201361", m: "Jesus is the grain of wheat which dies. From that lifeless grain comes forth the great multiplication of bread which will endure until the end of the world. The mystery of the Eucharist already shines forth in the burial of Jesus.", p: "Lord Jesus Christ, in Your burial You have taken on the death of the grain of wheat. You have become the lifeless grain which produces abundant fruit for every age and for all eternity. You did not see corruption. You have risen, and have made a place for our transfigured flesh in the very heart of God. Amen." },
];
const RZ_CL = "Lord Jesus Christ, at the hour of Your death the whole of creation was darkened. Yet from the tomb there shines forth the promise of life. You are the grain of wheat which, by dying, has produced abundant fruit. We believe in You, and because we believe in You we know that the power of love is stronger than the power of evil and death. Grant us the grace to follow in Your footsteps, to take up our cross each day, and to trust that by dying we shall truly live. Amen.";
const ST_VER = {
  alphonsus: { id: "alphonsus", label: "St. Alphonsus Liguori", desc: "Redemptorist \u00b7 most widely used", icon: "\u271d", op: AL_OP, st: AL_ST, cl: AL_CL, clT: "Prayer to Jesus Christ Crucified" },
  franciscan: { id: "franciscan", label: "Franciscan", desc: "Classic \u00b7 St. Francis of Assisi", icon: "\ud83d\udd4a", op: FR_OP, st: FR_ST, cl: FR_CL, clT: "Concluding Prayer" },
  ratzinger: { id: "ratzinger", label: "Cardinal Ratzinger", desc: "Good Friday 2005 \u00b7 Colosseum", icon: "\ud83c\udfdb", op: RZ_OP, st: RZ_ST, cl: RZ_CL, clT: "Closing Prayer", hasSc: true },
};

// ═══════════════════════════════════════════════════════════════════
// ROSARY — DATA
// ═══════════════════════════════════════════════════════════════════
const ROSARY_PRAYERS = {
  creed: "I believe in God, the Father almighty, Creator of heaven and earth, and in Jesus Christ, His only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried; He descended into hell; on the third day He rose again from the dead; He ascended into heaven, and is seated at the right hand of God the Father almighty; from there He will come to judge the living and the dead. I believe in the Holy Spirit, the Holy Catholic Church, the communion of Saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.",
  ourFather: "Our Father, who art in heaven, hallowed be Thy name; Thy kingdom come; Thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.",
  hailMary: "Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.",
  gloryBe: "Glory be to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and ever shall be, world without end. Amen.",
  fatima: "O my Jesus, forgive us our sins, save us from the fires of Hell, and lead all souls to Heaven, especially those in most need of Thy mercy.",
  hailHolyQueen: "Hail, Holy Queen, Mother of Mercy, our life, our sweetness and our hope. To thee do we cry, poor banished children of Eve. To thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious Advocate, thine eyes of mercy toward us, and after this our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary.\n\nV. Pray for us, O holy Mother of God.\nR. That we may be made worthy of the promises of Christ.",
  closing: "O God, whose Only Begotten Son, by His life, death, and resurrection, has purchased for us the rewards of eternal life, grant, we beseech Thee, that while meditating on these mysteries of the Most Holy Rosary of the Blessed Virgin Mary, we may imitate what they contain and obtain what they promise, through the same Christ our Lord. Amen.",
};
const ROSARY_MYSTERIES = {
  joyful: { label: "Joyful Mysteries", day: "Monday & Saturday", icon: "⭐", color: "#d4a843", mysteries: [
    { title: "The Annunciation", scripture: "The angel Gabriel was sent from God to a virgin betrothed to a man named Joseph. The angel said, 'Hail, full of grace, the Lord is with thee.'", ref: "Lk 1:26\u201338", fruit: "Humility",
      img: "/images/joyful-1-annunciation.jpg", credit: "James Tissot · Brooklyn Museum" },
    { title: "The Visitation", scripture: "Mary arose and went with haste into the hill country. Elizabeth was filled with the Holy Spirit and cried out, 'Blessed art thou among women.'", ref: "Lk 1:39\u201356", fruit: "Love of Neighbor",
      img: "/images/joyful-2-visitation.jpg", credit: "James Tissot · Brooklyn Museum" },
    { title: "The Nativity", scripture: "She brought forth her firstborn Son, and wrapped Him in swaddling clothes, and laid Him in a manger, because there was no room for them in the inn.", ref: "Lk 2:1\u201321", fruit: "Poverty of Spirit",
      img: "/images/joyful-3-nativity.jpg", credit: "James Tissot · Brooklyn Museum" },
    { title: "The Presentation", scripture: "They brought Him to Jerusalem to present Him to the Lord. Simeon said, 'Now Thou dost dismiss Thy servant in peace, for mine eyes have seen Thy salvation.'", ref: "Lk 2:22\u201340", fruit: "Obedience",
      img: "/images/joyful-4-presentation.jpg", credit: "James Tissot · Brooklyn Museum" },
    { title: "Finding in the Temple", scripture: "After three days they found Him in the temple, sitting among the teachers. He said, 'Did you not know that I must be about My Father's business?'", ref: "Lk 2:41\u201352", fruit: "Joy in Finding Jesus",
      img: "/images/joyful-5-finding.jpg", credit: "James Tissot · Brooklyn Museum" },
  ]},
  sorrowful: { label: "Sorrowful Mysteries", day: "Tuesday & Friday", icon: "✝", color: "#7a1c1c", mysteries: [
    { title: "The Agony in the Garden", scripture: "He went a little further and fell on His face and prayed, 'My Father, if it be possible, let this chalice pass from Me; yet not My will but Thine be done.'", ref: "Mt 26:36\u201346", fruit: "Sorrow for Sin",
      img: "/images/sorrowful-1-agony.jpg", credit: "James Tissot · Brooklyn Museum" },
    { title: "The Scourging at the Pillar", scripture: "Then Pilate took Jesus and had Him scourged.", ref: "Jn 19:1", fruit: "Purity",
      img: "/images/sorrowful-2-scourging.jpg", credit: "James Tissot · Brooklyn Museum" },
    { title: "The Crowning with Thorns", scripture: "They twisted together a crown of thorns and put it on His head, and a reed in His right hand, and knelt before Him and mocked Him.", ref: "Mt 27:27\u201331", fruit: "Courage",
      img: "/images/sorrowful-3-crowning.jpg", credit: "James Tissot · Brooklyn Museum" },
    { title: "The Carrying of the Cross", scripture: "And bearing His own cross, He went forth to the place called Calvary.", ref: "Jn 19:17", fruit: "Patience",
      img: "/images/sorrowful-4-carrying.jpg", credit: "James Tissot · Brooklyn Museum" },
    { title: "The Crucifixion", scripture: "Jesus said, 'Father, forgive them, for they know not what they do.' And bowing His head, He gave up His spirit.", ref: "Jn 19:18\u201330", fruit: "Perseverance",
      img: "/images/sorrowful-5-crucifixion.jpg", credit: "James Tissot · Brooklyn Museum" },
  ]},
  glorious: { label: "Glorious Mysteries", day: "Wednesday & Sunday", icon: "👑", color: "#d4a843", mysteries: [
    { title: "The Resurrection", scripture: "He is not here; He is risen, as He said. Come, see the place where the Lord was laid.", ref: "Mt 28:1\u201310", fruit: "Faith",
      img: "/images/glorious-1-resurrection.jpg", credit: "James Tissot · Brooklyn Museum" },
    { title: "The Ascension", scripture: "He was lifted up, and a cloud took Him out of their sight. 'This Jesus will come in the same way as you saw Him go into heaven.'", ref: "Acts 1:9\u201311", fruit: "Hope",
      img: "/images/glorious-2-ascension.jpg", credit: "James Tissot · Brooklyn Museum" },
    { title: "The Descent of the Holy Spirit", scripture: "They were all filled with the Holy Spirit and began to speak in other tongues, as the Spirit gave them utterance.", ref: "Acts 2:1\u201313", fruit: "Love of God",
      img: "/images/glorious-3-pentecost.jpg", credit: "Adriaen van der Werff · Bavarian State Painting Collections, Electoral Gallery Düsseldorf" },
    { title: "The Assumption of Mary", scripture: "A great sign appeared in heaven: a woman clothed with the sun, with the moon under her feet, and on her head a crown of twelve stars.", ref: "Rev 12:1", fruit: "Grace of a Happy Death",
      img: "/images/glorious-4-assumption.jpg", credit: "Guido Reni (1642) · Alte Pinakothek" },
    { title: "The Coronation of Mary", scripture: "The Lord said, 'Well done, good and faithful servant; enter into the joy of thy Master.'", ref: "Mt 25:21", fruit: "Trust in Mary's Intercession",
      img: "/images/glorious-5-coronation.jpg", credit: "Diego Velázquez (1644) · Museo del Prado" },
  ]},
};

// ═══════════════════════════════════════════════════════════════════
// LITURGICAL CALENDAR ENGINE
// ═══════════════════════════════════════════════════════════════════
function computeEaster(year) {
  // Anonymous Gregorian algorithm
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function daysBetween(a, b) {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function addDays(d, n) {
  const r = new Date(d); r.setDate(r.getDate() + n); return r;
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getLiturgicalDay(date) {
  const y = date.getFullYear();
  const m = date.getMonth(); // 0-indexed
  const d = date.getDate();
  const dow = date.getDay(); // 0=Sun
  const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const dayName = dayNames[dow];

  const easter = computeEaster(y);
  const diff = daysBetween(easter, date); // negative = before Easter

  // Key moveable dates
  const septuagesima = addDays(easter, -63); // 9th Sunday before Easter
  const sexagesima = addDays(easter, -56);
  const quinquagesima = addDays(easter, -49);
  const ashWed = addDays(easter, -46);
  const lent1Sun = addDays(easter, -42);
  const lent2Sun = addDays(easter, -35);
  const lent3Sun = addDays(easter, -28);
  const lent4Sun = addDays(easter, -21); // Laetare
  const passionSun = addDays(easter, -14);
  const palmSun = addDays(easter, -7);
  const holyThurs = addDays(easter, -3);
  const goodFri = addDays(easter, -2);
  const holySat = addDays(easter, -1);
  const ascension = addDays(easter, 39);
  const pentecost = addDays(easter, 49);
  const trinity = addDays(easter, 56);
  const corpusChristi = addDays(easter, 60);

  // Advent: Sunday nearest Nov 30 (4 Sundays before Christmas)
  const christmas = new Date(y, 11, 25);
  const christmasDow = christmas.getDay();
  const advent1 = addDays(christmas, -(christmasDow === 0 ? 28 : 21 + christmasDow));
  // Next year's data for post-Christmas
  const nextEaster = computeEaster(y + 1);
  const nextSeptuagesima = addDays(nextEaster, -63);

  let ef = { season: "", title: "", rank: "", color: "green", ofTitle: "" };

  // ── FIXED FEASTS (major ones, 1962 calendar) ──
  const fixedFeasts = {
    "1-1": { t: "Circumcision of Our Lord", r: "I Class", c: "white" },
    "1-6": { t: "Epiphany of Our Lord", r: "I Class", c: "white" },
    "2-2": { t: "Purification of the B.V.M.", r: "II Class", c: "white", alt: "Presentation of the Lord" },
    "2-22": { t: "Chair of St. Peter", r: "I Class", c: "white" },
    "3-19": { t: "St. Joseph, Spouse of the B.V.M.", r: "I Class", c: "white" },
    "3-25": { t: "Annunciation of the B.V.M.", r: "I Class", c: "white" },
    "5-1": { t: "St. Joseph the Worker", r: "I Class", c: "white" },
    "6-24": { t: "Nativity of St. John the Baptist", r: "I Class", c: "white" },
    "6-29": { t: "Sts. Peter & Paul", r: "I Class", c: "red" },
    "7-25": { t: "St. James, Apostle", r: "II Class", c: "red" },
    "8-6": { t: "Transfiguration of Our Lord", r: "II Class", c: "white" },
    "8-15": { t: "Assumption of the B.V.M.", r: "I Class", c: "white" },
    "9-8": { t: "Nativity of the B.V.M.", r: "II Class", c: "white" },
    "9-14": { t: "Exaltation of the Holy Cross", r: "II Class", c: "red" },
    "9-29": { t: "St. Michael the Archangel", r: "I Class", c: "white" },
    "10-7": { t: "Our Lady of the Rosary", r: "II Class", c: "white" },
    "11-1": { t: "All Saints", r: "I Class", c: "white" },
    "11-2": { t: "All Souls", r: "I Class", c: "black" },
    "11-21": { t: "Presentation of the B.V.M.", r: "III Class", c: "white" },
    "12-8": { t: "Immaculate Conception", r: "I Class", c: "white" },
    "12-25": { t: "Nativity of Our Lord", r: "I Class", c: "white" },
    "12-26": { t: "St. Stephen, Protomartyr", r: "II Class", c: "red" },
    "12-27": { t: "St. John, Apostle & Evangelist", r: "II Class", c: "white" },
    "12-28": { t: "Holy Innocents", r: "II Class", c: "red" },
  };

  const fixedKey = (m + 1) + "-" + d;
  const fixed = fixedFeasts[fixedKey] || null;

  // ── TEMPORAL CYCLE ──

  // Christmas season (Dec 25 – Epiphany octave)
  if ((m === 11 && d >= 25) || (m === 0 && d <= 13)) {
    ef.season = "Christmastide";
    ef.color = "white";
    if (m === 11 && d === 25) { ef.title = "Nativity of Our Lord"; ef.rank = "I Class"; }
    else if (m === 11 && d === 31) { ef.title = "St. Sylvester I, Pope"; ef.rank = "III Class"; }
    else if (m === 0 && d === 1) { ef.title = "Circumcision of Our Lord"; ef.rank = "I Class"; }
    else if (m === 0 && d === 6) { ef.title = "Epiphany of Our Lord"; ef.rank = "I Class"; }
    else if (dow === 0 && m === 0 && d >= 2 && d <= 5) { ef.title = "Holy Name of Jesus"; ef.rank = "II Class"; }
    else if (dow === 0 && m === 0 && d >= 7 && d <= 13) { ef.title = "Holy Family"; ef.rank = "I Class"; }
    else if (!ef.title) {
      ef.title = dayName + " in Christmastide";
      ef.rank = "IV Class";
    }
  }
  // Epiphany to Septuagesima
  else if (date < septuagesima && m === 0 && d >= 14) {
    const epiphany = new Date(y, 0, 6);
    const firstSunAfterEpiph = addDays(epiphany, (7 - epiphany.getDay()) % 7 || 7);
    ef.season = "After Epiphany";
    ef.color = "green";
    if (dow === 0) {
      const sunNum = Math.floor(daysBetween(firstSunAfterEpiph, date) / 7) + 1;
      const ordinals = ["","1st","2nd","3rd","4th","5th","6th"];
      ef.title = (ordinals[sunNum] || sunNum + "th") + " Sunday after Epiphany";
      ef.rank = "II Class";
    } else {
      ef.title = dayName + " after Epiphany";
      ef.rank = "IV Class";
    }
  }
  // Septuagesima season
  else if (date >= septuagesima && date < ashWed) {
    ef.season = "Septuagesima · Pre-Lent";
    ef.color = "violet";
    if (sameDay(date, septuagesima)) { ef.title = "Septuagesima Sunday"; ef.rank = "II Class"; }
    else if (sameDay(date, sexagesima)) { ef.title = "Sexagesima Sunday"; ef.rank = "II Class"; }
    else if (sameDay(date, quinquagesima)) { ef.title = "Quinquagesima Sunday"; ef.rank = "II Class"; }
    else { ef.title = dayName + " after " + (date < sexagesima ? "Septuagesima" : date < quinquagesima ? "Sexagesima" : "Quinquagesima"); ef.rank = "IV Class"; }
  }
  // Lent
  else if (date >= ashWed && date < passionSun) {
    ef.season = "Lent";
    ef.color = "violet";
    if (sameDay(date, ashWed)) { ef.title = "Ash Wednesday"; ef.rank = "I Class"; }
    else if (sameDay(date, lent4Sun)) { ef.title = "Laetare Sunday"; ef.rank = "I Class"; ef.color = "rose"; }
    else if (sameDay(date, lent1Sun)) { ef.title = "First Sunday of Lent"; ef.rank = "I Class"; }
    else if (sameDay(date, lent2Sun)) { ef.title = "Second Sunday of Lent"; ef.rank = "I Class"; }
    else if (sameDay(date, lent3Sun)) { ef.title = "Third Sunday of Lent"; ef.rank = "I Class"; }
    else {
      const lentDay = daysBetween(ashWed, date);
      if (lentDay < 4) {
        // Thu, Fri, Sat after Ash Wednesday
        ef.title = dayName + " after Ash Wednesday";
        ef.rank = "III Class";
      } else {
        const lentWeek = Math.floor((lentDay - 4) / 7) + 1;
        const weekNames = ["","1st","2nd","3rd","4th","5th"];
        const weekName = weekNames[lentWeek] || lentWeek + "th";
        if (dow === 3 && lentWeek === 1) { ef.title = "Ember Wednesday of Lent"; ef.rank = "II Class"; }
        else if (dow === 5 && lentWeek === 1) { ef.title = "Ember Friday of Lent"; ef.rank = "II Class"; }
        else if (dow === 6 && lentWeek === 1) { ef.title = "Ember Saturday of Lent"; ef.rank = "II Class"; }
        else { ef.title = dayName + " of the " + weekName + " Week of Lent"; ef.rank = "III Class"; }
      }
    }
  }
  // Passiontide
  else if (date >= passionSun && date < easter) {
    ef.season = "Passiontide";
    ef.color = "violet";
    if (sameDay(date, passionSun)) { ef.title = "Passion Sunday"; ef.rank = "I Class"; }
    else if (sameDay(date, palmSun)) { ef.title = "Palm Sunday"; ef.rank = "I Class"; ef.color = "red"; }
    else if (sameDay(date, holyThurs)) { ef.title = "Holy Thursday"; ef.rank = "I Class"; ef.color = "white"; }
    else if (sameDay(date, goodFri)) { ef.title = "Good Friday"; ef.rank = "I Class"; ef.color = "black"; }
    else if (sameDay(date, holySat)) { ef.title = "Holy Saturday"; ef.rank = "I Class"; ef.color = "violet"; }
    else if (date > palmSun) {
      ef.title = dayName + " of Holy Week";
      ef.rank = "I Class";
      ef.color = "violet";
    } else {
      ef.title = dayName + " of Passion Week";
      ef.rank = "III Class";
    }
  }
  // Easter season
  else if (date >= easter && date < pentecost) {
    ef.season = "Eastertide";
    ef.color = "white";
    if (sameDay(date, easter)) { ef.title = "Easter Sunday"; ef.rank = "I Class"; }
    else if (diff <= 6) { ef.title = dayName + " in the Octave of Easter"; ef.rank = "I Class"; }
    else if (diff === 7) { ef.title = "Low Sunday"; ef.rank = "I Class"; }
    else if (sameDay(date, ascension)) { ef.title = "Ascension of Our Lord"; ef.rank = "I Class"; }
    else if (dow === 0) {
      const easterSunNum = Math.floor(diff / 7);
      const ordinals = ["","","2nd","3rd","4th","5th","Sunday after Ascension"];
      if (diff > 39) { ef.title = "Sunday after the Ascension"; }
      else { ef.title = (ordinals[easterSunNum] || easterSunNum + "th") + " Sunday after Easter"; }
      ef.rank = "I Class";
    } else {
      // Weekday: name after preceding Sunday for reading lookup
      const easterSunNum = Math.floor(diff / 7);
      if (diff > 39) {
        ef.title = dayName + " after the Ascension";
      } else if (easterSunNum >= 2) {
        const ordinals2 = ["","","2nd","3rd","4th","5th"];
        ef.title = dayName + " after the " + (ordinals2[easterSunNum] || easterSunNum + "th") + " Sunday after Easter";
      } else {
        ef.title = dayName + " of Eastertide";
      }
      ef.rank = "IV Class";
    }
  }
  // Pentecost & after
  else if (date >= pentecost) {
    if (sameDay(date, pentecost)) { ef.season = "Pentecost"; ef.title = "Pentecost Sunday"; ef.rank = "I Class"; ef.color = "red"; }
    else if (diff <= 55) {
      ef.season = "Pentecost";
      if (sameDay(date, trinity)) { ef.title = "Trinity Sunday"; ef.rank = "I Class"; ef.color = "white"; }
      else if (sameDay(date, corpusChristi)) { ef.title = "Corpus Christi"; ef.rank = "I Class"; ef.color = "white"; }
      else if (diff <= 55 && diff > 49) {
        ef.title = dayName + " in the Octave of Pentecost";
        ef.rank = diff === 52 ? "I Class" : "I Class"; // Ember days
        ef.color = "red";
      } else {
        ef.title = dayName + " after Pentecost"; ef.rank = "IV Class"; ef.color = "green";
      }
    } else {
      ef.season = "After Pentecost";
      ef.color = "green";
      // Count Sundays after Pentecost
      const pentSun = pentecost;
      const weeksAfterPent = Math.floor(daysBetween(pentSun, date) / 7);
      if (dow === 0) {
        const sunNum = weeksAfterPent;
        // Check if we're in Advent
        if (date >= advent1) {
          const advWeeks = Math.floor(daysBetween(advent1, date) / 7);
          const advOrd = ["First","Second","Third","Fourth"];
          ef.season = "Advent";
          ef.color = "violet";
          ef.title = (advOrd[advWeeks] || "Advent") + " Sunday of Advent";
          ef.rank = "I Class";
          if (advWeeks === 2) ef.color = "rose"; // Gaudete
        } else {
          const suf = (sunNum % 10 === 1 && sunNum !== 11) ? "st" : (sunNum % 10 === 2 && sunNum !== 12) ? "nd" : (sunNum % 10 === 3 && sunNum !== 13) ? "rd" : "th";
          ef.title = sunNum + suf + " Sunday after Pentecost";
          ef.rank = "II Class";
        }
      } else {
        if (date >= advent1) {
          const advWeeks = Math.floor(daysBetween(advent1, date) / 7);
          ef.season = "Advent";
          ef.color = "violet";
          ef.title = dayName + " of the " + ["1st","2nd","3rd","4th"][advWeeks] + " Week of Advent";
          ef.rank = "III Class";
        } else {
          ef.title = dayName + " after Pentecost"; ef.rank = "IV Class";
        }
      }
    }
  }
  // After Epiphany for months > January (before Septuagesima)
  else {
    ef.season = "After Epiphany";
    ef.color = "green";
    if (dow === 0) {
      const epiphany2 = new Date(y, 0, 6);
      const firstSunAE = addDays(epiphany2, (7 - epiphany2.getDay()) % 7 || 7);
      const sunNum = Math.floor(daysBetween(firstSunAE, date) / 7) + 1;
      ef.title = sunNum + (sunNum === 2 ? "nd" : sunNum === 3 ? "rd" : "th") + " Sunday after Epiphany";
      ef.rank = "II Class";
    } else {
      ef.title = dayName + " after Epiphany"; ef.rank = "IV Class";
    }
  }

  // Fixed feast override for high-ranking feasts
  if (fixed && (fixed.r === "I Class" || fixed.r === "II Class")) {
    // On Sundays of I Class, the Sunday takes precedence
    if (dow === 0 && ef.rank === "I Class") {
      ef.fixedFeast = fixed.t;
    } else if (ef.rank === "I Class" && fixed.r === "II Class") {
      // I Class temporal day beats II Class feast
      ef.fixedFeast = fixed.t;
    } else {
      // Feast takes precedence: swap
      ef.fixedFeast = ef.title;
      ef.title = fixed.t;
      ef.rank = fixed.r;
      ef.color = fixed.c;
    }
  } else if (fixed) {
    ef.fixedFeast = fixed.t;
  }

  // ── ORDINARY FORM (simplified) ──
  const ofEaster = easter; // Same computation
  const ofAshWed = ashWed;
  const ofAdvent1 = advent1;

  if (date >= ofAdvent1 || (m === 11 && d >= 25) || (m === 0 && d <= 6)) {
    if (m === 11 && d >= 25) ef.ofTitle = "Christmas Season";
    else if (m === 0 && d <= 6) ef.ofTitle = m === 0 && d === 6 ? "Epiphany of the Lord" : "Christmas Season";
    else {
      const advW = Math.floor(daysBetween(ofAdvent1, date) / 7) + 1;
      ef.ofTitle = advW + (advW === 1 ? "st" : advW === 2 ? "nd" : advW === 3 ? "rd" : "th") + " Week of Advent";
    }
  } else if (date >= ofAshWed && date < ofEaster) {
    const lentDay = daysBetween(ofAshWed, date);
    const lentW = Math.floor(lentDay / 7) + 1;
    if (sameDay(date, ofAshWed)) ef.ofTitle = "Ash Wednesday";
    else if (sameDay(date, palmSun)) ef.ofTitle = "Palm Sunday";
    else if (date > palmSun) ef.ofTitle = "Holy Week";
    else ef.ofTitle = lentW + (lentW === 1 ? "st" : lentW === 2 ? "nd" : lentW === 3 ? "rd" : "th") + " Week of Lent";
  } else if (date >= ofEaster && date < addDays(ofEaster, 50)) {
    if (sameDay(date, ofEaster)) ef.ofTitle = "Easter Sunday";
    else if (sameDay(date, addDays(ofEaster, 49))) ef.ofTitle = "Pentecost Sunday";
    else if (sameDay(date, addDays(ofEaster, 39))) ef.ofTitle = "Ascension of the Lord";
    else {
      const eastW = Math.floor(daysBetween(ofEaster, date) / 7) + 1;
      ef.ofTitle = eastW + (eastW === 1 ? "st" : eastW === 2 ? "nd" : eastW === 3 ? "rd" : "th") + " Week of Easter";
    }
  } else {
    // Ordinary Time
    // Weeks 1-8 before Lent, then continues after Pentecost
    if (date < ofAshWed) {
      const jan7 = new Date(y, 0, 7);
      const wk = Math.floor(daysBetween(jan7, date) / 7) + 1;
      ef.ofTitle = wk + (wk === 1 ? "st" : wk === 2 ? "nd" : wk === 3 ? "rd" : "th") + " Week of Ordinary Time";
    } else {
      // After Pentecost: count backward from Advent to get week number
      const pentEnd = addDays(ofEaster, 50);
      const weeksRemaining = Math.floor(daysBetween(date, ofAdvent1) / 7);
      const wk = 34 - weeksRemaining;
      ef.ofTitle = wk + (wk === 1 ? "st" : wk === 2 ? "nd" : wk === 3 ? "rd" : "th") + " Week of Ordinary Time";
    }
  }

  // OF fixed feast override
  if (fixed && fixed.alt) ef.ofFeast = fixed.alt;
  else if (fixed) ef.ofFeast = fixed.t;

  return ef;
}

// Liturgical color display
const COLOR_NAMES = { white: "White", red: "Red", green: "Green", violet: "Violet", rose: "Rose", black: "Black" };
const COLOR_HEX = { white: "#e8e0d0", red: "#8a2020", green: "#2a5a3a", violet: "#5a2a7a", rose: "#c27a8a", black: "#222" };

// ═══════════════════════════════════════════════════════════════════
// EF PROPERS — READINGS (Douay-Rheims, public domain)
// ═══════════════════════════════════════════════════════════════════
const EF_READINGS = {
  // ── CHRISTMAS CYCLE ──
  "Nativity of Our Lord": { e: { r: "Heb 1:1\u20131:12", t: "God, who at sundry times and in divers manners spoke in times past to the fathers by the prophets, last of all in these days hath spoken to us by His Son, whom He hath appointed heir of all things." }, g: { r: "Jn 1:1\u201314", t: "In the beginning was the Word, and the Word was with God, and the Word was God. And the Word was made flesh, and dwelt among us." } },
  "St. Stephen, Protomartyr": { e: { r: "Acts 6:8\u201310; 7:54\u201359", t: "Stephen, full of grace and fortitude, did great wonders among the people. Behold, I see the heavens opened, and the Son of man standing on the right hand of God." }, g: { r: "Mt 23:34\u201339", t: "Behold I send to you prophets, and wise men, and scribes: and some of them you will put to death." } },
  "St. John, Apostle & Evangelist": { e: { r: "Ecclus 15:1\u20136", t: "He that feareth God will do good; and he that possesseth justice shall lay hold on her." }, g: { r: "Jn 21:19\u201324", t: "Follow Me. This is that disciple who giveth testimony of these things; and we know that his testimony is true." } },
  "Holy Innocents": { e: { r: "Apoc 14:1\u20135", t: "I beheld, and lo a Lamb stood upon mount Sion, and with Him a hundred forty-four thousand." }, g: { r: "Mt 2:13\u201318", t: "An angel of the Lord appeared in sleep to Joseph: Arise, take the Child and His Mother, and fly into Egypt." } },
  "Sunday in Christmastide": { e: { r: "Gal 4:1\u20137", t: "When the fulness of the time was come, God sent His Son, made of a woman, made under the law, that He might redeem them who were under the law." }, g: { r: "Lk 2:33\u201340", t: "Simeon said: Behold this Child is set for the fall, and for the resurrection of many in Israel." } },
  "Holy Name of Jesus": { e: { r: "Acts 4:8\u201312", t: "There is no other name under heaven given to men, whereby we must be saved." }, g: { r: "Lk 2:21", t: "After eight days were accomplished, that the Child should be circumcised, His name was called Jesus." } },
  "Circumcision of Our Lord": { e: { r: "Tit 2:11\u201315", t: "The grace of God our Saviour hath appeared to all men, instructing us, that, denying ungodliness, we should live soberly, and justly, and godly in this world." }, g: { r: "Lk 2:21", t: "After eight days were accomplished, that the Child should be circumcised, His name was called Jesus." } },
  "Epiphany of Our Lord": { e: { r: "Is 60:1\u20136", t: "Arise, be enlightened, O Jerusalem: for thy light is come, and the glory of the Lord is risen upon thee." }, g: { r: "Mt 2:1\u201312", t: "When Jesus was born in Bethlehem of Juda, behold, there came wise men from the East to Jerusalem, saying: Where is He that is born King of the Jews?" } },
  "Holy Family": { e: { r: "Col 3:12\u201317", t: "Put ye on, as the elect of God, holy and beloved, the bowels of mercy, benignity, humility, modesty, patience." }, g: { r: "Lk 2:42\u201352", t: "They found Him in the temple, sitting in the midst of the doctors, hearing them and asking them questions." } },

  // ── AFTER EPIPHANY ──
  "1st Sunday after Epiphany": { e: { r: "Rom 12:1\u20135", t: "I beseech you, brethren, that you present your bodies a living sacrifice, holy, pleasing unto God." }, g: { r: "Lk 2:42\u201352", t: "They found Him in the temple, sitting in the midst of the doctors. Son, why hast Thou done so to us?" } },
  "2nd Sunday after Epiphany": { e: { r: "Rom 12:6\u201316", t: "Having different gifts, according to the grace that is given us: whether prophecy, to be used according to the rule of faith." }, g: { r: "Jn 2:1\u201311", t: "There was a marriage in Cana of Galilee: and the mother of Jesus was there. His mother saith to the waiters: Whatsoever He shall say to you, do ye." } },
  "3rd Sunday after Epiphany": { e: { r: "Rom 12:16\u201321", t: "Be not wise in your own conceits. To no man rendering evil for evil. If it be possible, as much as is in you, having peace with all men." }, g: { r: "Mt 8:1\u201313", t: "Lord, I am not worthy that Thou shouldst enter under my roof; but only say the word, and my servant shall be healed." } },
  "4th Sunday after Epiphany": { e: { r: "Rom 13:8\u201310", t: "Owe no man anything, but to love one another. For he that loveth his neighbor hath fulfilled the law." }, g: { r: "Mt 8:23\u201327", t: "He arose, and commanded the winds, and the sea, and there came a great calm." } },
  "5th Sunday after Epiphany": { e: { r: "Col 3:12\u201317", t: "Above all things have charity, which is the bond of perfection. And let the peace of Christ rejoice in your hearts." }, g: { r: "Mt 13:24\u201330", t: "The kingdom of heaven is likened to a man that sowed good seed in his field. But while men were asleep, his enemy came and oversowed cockle." } },
  "6th Sunday after Epiphany": { e: { r: "1 Thess 1:2\u201310", t: "We give thanks to God always for you all, knowing, brethren beloved of God, your election." }, g: { r: "Mt 13:31\u201335", t: "The kingdom of heaven is like to a grain of mustard seed. It is the least of all seeds; but when it is grown up, it is greater than all herbs." } },

  // ── SEPTUAGESIMA ──
  "Septuagesima Sunday": { e: { r: "1 Cor 9:24\u201310:5", t: "Know you not that they that run in the race, all run indeed, but one receiveth the prize? So run that you may obtain." }, g: { r: "Mt 20:1\u201316", t: "The kingdom of heaven is like to a householder, who went out early in the morning to hire laborers into his vineyard." } },
  "Sexagesima Sunday": { e: { r: "2 Cor 11:19\u201312:9", t: "Gladly therefore will I glory in my infirmities, that the power of Christ may dwell in me." }, g: { r: "Lk 8:4\u201315", t: "The seed is the word of God. And they on the good ground are they who, hearing the word, keep it and bring forth fruit in patience." } },
  "Quinquagesima Sunday": { e: { r: "1 Cor 13:1\u201313", t: "If I speak with the tongues of men and of angels, and have not charity, I am become as sounding brass." }, g: { r: "Lk 18:31\u201343", t: "Jesus took unto Him the twelve and said: Behold, we go up to Jerusalem, and all things shall be accomplished which were written by the prophets." } },

  // ── LENT ──
  "Ash Wednesday": { e: { r: "Joel 2:12\u201319", t: "Be converted to Me with all your heart, in fasting, and in weeping, and in mourning. Rend your hearts, and not your garments." }, g: { r: "Mt 6:16\u201321", t: "When you fast, be not as the hypocrites, sad. But thou, when thou fastest, anoint thy head and wash thy face." } },
  "Thursday after Ash Wednesday": { e: { r: "Is 38:1\u20136", t: "I have heard thy prayer, and I have seen thy tears: behold I will add to thy days fifteen years." }, g: { r: "Mt 8:5\u201313", t: "Lord, I am not worthy that Thou shouldst enter under my roof; but only say the word, and my servant shall be healed." } },
  "Friday after Ash Wednesday": { e: { r: "Is 58:1\u20139", t: "Is not this rather the fast that I have chosen? Loose the bands of wickedness, undo the bundles that oppress." }, g: { r: "Mt 5:43\u20136:4", t: "Love your enemies: do good to them that hate you: and pray for them that persecute and calumniate you." } },
  "Saturday after Ash Wednesday": { e: { r: "Is 58:9\u201314", t: "When thou shalt pour out thy soul to the hungry and shalt satisfy the afflicted soul, then shall thy light rise up in darkness." }, g: { r: "Mk 6:47\u201356", t: "He saw them labouring in rowing. And He came to them walking upon the sea, and He would have passed by them." } },
  "First Sunday of Lent": { e: { r: "2 Cor 6:1\u201310", t: "We exhort you that you receive not the grace of God in vain. Behold, now is the acceptable time; behold, now is the day of salvation." }, g: { r: "Mt 4:1\u201311", t: "Jesus was led by the Spirit into the desert, to be tempted by the devil. Not in bread alone doth man live, but in every word that proceedeth from the mouth of God." } },
  "Monday of the 1st Week of Lent": { e: { r: "Ez 34:11\u201316", t: "Behold I Myself will seek My sheep, and will visit them. I will feed them in the mountains of Israel." }, g: { r: "Mt 25:31\u201346", t: "When the Son of man shall come in His majesty: Come, ye blessed of My Father, possess you the kingdom prepared for you." } },
  "Tuesday of the 1st Week of Lent": { e: { r: "Is 55:6\u201311", t: "Seek ye the Lord while He may be found, call upon Him while He is near. Let the wicked forsake his way." }, g: { r: "Mt 21:10\u201317", t: "Jesus entered into the temple of God, and cast out all them that sold and bought in the temple." } },
  "Wednesday of the 1st Week of Lent": { e: { r: "Ex 24:12\u201318", t: "The Lord said to Moses: Come up to Me into the mount, and be there; and I will give thee tables of stone, and the law." }, g: { r: "Mt 12:38\u201350", t: "As Jonas was in the whale's belly three days and three nights: so shall the Son of man be in the heart of the earth." } },
  "Ember Wednesday of Lent": { e: { r: "Ex 24:12\u201318", t: "The Lord said to Moses: Come up to Me into the mount, and be there; and I will give thee tables of stone, and the law." }, g: { r: "Mt 12:38\u201350", t: "As Jonas was in the whale's belly three days and three nights: so shall the Son of man be in the heart of the earth." } },
  "Thursday of the 1st Week of Lent": { e: { r: "Ez 18:1\u20139", t: "If the wicked do penance for all his sins which he hath committed, he shall live and shall not die." }, g: { r: "Mt 15:21\u201328", t: "O woman, great is thy faith: be it done to thee as thou wilt. And her daughter was cured." } },
  "Friday of the 1st Week of Lent": { e: { r: "Ez 18:20\u201328", t: "When the wicked turneth himself away from his wickedness, and doeth judgment and justice, he shall save his soul alive." }, g: { r: "Jn 5:1\u201315", t: "Wilt thou be made whole? Jesus saith to him: Arise, take up thy bed and walk." } },
  "Ember Friday of Lent": { e: { r: "Ez 18:20\u201328", t: "When the wicked turneth himself away from his wickedness, and doeth judgment and justice, he shall save his soul alive." }, g: { r: "Jn 5:1\u201315", t: "Wilt thou be made whole? Jesus saith to him: Arise, take up thy bed and walk." } },
  "Saturday of the 1st Week of Lent": { e: { r: "Deut 26:12\u201319", t: "Look forth from Thy sanctuary, and Thy high habitation of heaven, and bless Thy people Israel." }, g: { r: "Mt 17:1\u20139", t: "Jesus taketh unto Him Peter and James and John his brother, and bringeth them up into a high mountain apart: and He was transfigured before them." } },
  "Ember Saturday of Lent": { e: { r: "Deut 26:12\u201319", t: "Look forth from Thy sanctuary, and Thy high habitation of heaven, and bless Thy people Israel." }, g: { r: "Mt 17:1\u20139", t: "Jesus taketh unto Him Peter and James and John his brother, and bringeth them up into a high mountain apart: and He was transfigured before them." } },
  "Second Sunday of Lent": { e: { r: "1 Thess 4:1\u20137", t: "We pray and beseech you in the Lord Jesus, that as you have received from us how you ought to walk and to please God, so also you would walk." }, g: { r: "Mt 17:1\u20139", t: "His face did shine as the sun, and His garments became white as snow. And behold there appeared Moses and Elias talking with Him." } },
  "Monday of the 2nd Week of Lent": { e: { r: "Dan 9:15\u201319", t: "We have sinned, we have committed iniquity. O Lord, let Thy anger be turned away from Thy city Jerusalem." }, g: { r: "Jn 8:21\u201329", t: "When you shall have lifted up the Son of man, then shall you know that I am He, and that I do nothing of Myself." } },
  "Tuesday of the 2nd Week of Lent": { e: { r: "3 Kgs 17:8\u201316", t: "The Lord said to Elias: Arise and go to Sarephta. The pot of meal wasted not, and the cruse of oil was not diminished." }, g: { r: "Mt 23:1\u201312", t: "The scribes and the Pharisees have sitten on the chair of Moses. He that is the greatest among you shall be your servant." } },
  "Wednesday of the 2nd Week of Lent": { e: { r: "Est 13:8\u201317", t: "O Lord, King Almighty, all things are in Thy power, and there is none that can resist Thy will." }, g: { r: "Mt 20:17\u201328", t: "The Son of man shall be betrayed to the chief priests, and they shall condemn Him to death. The Son of man is come to minister, and to give His life a redemption for many." } },
  "Thursday of the 2nd Week of Lent": { e: { r: "Jer 17:5\u201310", t: "Cursed be the man that trusteth in man. Blessed be the man that trusteth in the Lord. The heart is perverse above all things; who can know it?" }, g: { r: "Lk 16:19\u201331", t: "There was a certain rich man who was clothed in purple. And there was a certain beggar named Lazarus." } },
  "Friday of the 2nd Week of Lent": { e: { r: "Gen 37:6\u201322", t: "Come, let us kill him, and we shall see what his dreams avail him. And Ruben said: Do not take away his life." }, g: { r: "Mt 21:33\u201346", t: "A certain householder planted a vineyard. Last of all he sent to them his son. This is the heir; come, let us kill him." } },
  "Saturday of the 2nd Week of Lent": { e: { r: "Gen 27:6\u201340", t: "Jacob went to his father and said: I am Esau thy firstborn. Isaac blessed him." }, g: { r: "Lk 15:11\u201332", t: "A certain man had two sons. Father, I have sinned against heaven and before thee; I am not now worthy to be called thy son." } },
  "Third Sunday of Lent": { e: { r: "Eph 5:1\u20139", t: "Be ye therefore followers of God, as most dear children, and walk in love, as Christ also hath loved us." }, g: { r: "Lk 11:14\u201328", t: "Every kingdom divided against itself shall be brought to desolation. Blessed are they who hear the word of God and keep it." } },
  "Monday of the 3rd Week of Lent": { e: { r: "4 Kgs 5:1\u201315", t: "Naaman went down and washed in the Jordan seven times, and his flesh was restored like the flesh of a little child, and he was made clean." }, g: { r: "Lk 4:23\u201330", t: "There were many lepers in Israel in the time of Eliseus the prophet: and none of them was cleansed but Naaman the Syrian." } },
  "Tuesday of the 3rd Week of Lent": { e: { r: "4 Kgs 4:1\u20137", t: "Eliseus said: Go, sell the oil, and pay thy creditor; and thou and thy sons live of the rest." }, g: { r: "Mt 18:15\u201322", t: "If thy brother shall offend against thee, go and rebuke him. I say not to thee, till seven times; but till seventy times seven times." } },
  "Wednesday of the 3rd Week of Lent": { e: { r: "Ex 20:12\u201324", t: "The Lord spoke all these words: I am the Lord thy God. Thou shalt not have strange gods before Me." }, g: { r: "Mt 15:1\u201320", t: "Why do thy disciples transgress the tradition of the ancients? Not that which goeth into the mouth defileth a man; but what cometh out of the mouth." } },
  "Thursday of the 3rd Week of Lent": { e: { r: "Jer 7:1\u20137", t: "Amend your ways and your doings, and I will dwell with you in this place." }, g: { r: "Lk 4:38\u201344", t: "He stood over her and commanded the fever, and it left her. And He laid His hands upon every one of them and healed them." } },
  "Friday of the 3rd Week of Lent": { e: { r: "Num 20:1\u201313", t: "Moses lifted up his hand, and struck the rock twice with the rod: and there came forth water in great abundance." }, g: { r: "Jn 4:5\u201342", t: "If thou didst know the gift of God, and who He is that saith to thee, Give me to drink; thou wouldst have asked of Him, and He would have given thee living water." } },
  "Saturday of the 3rd Week of Lent": { e: { r: "Dan 13:1\u201362", t: "Susanna cried out with a loud voice: O eternal God, who knowest hidden things, Thou knowest that they have borne false witness against me." }, g: { r: "Jn 8:1\u201311", t: "He that is without sin among you, let him first cast a stone at her. Neither will I condemn thee. Go, and now sin no more." } },
  "Laetare Sunday": { e: { r: "Gal 4:22\u201331", t: "Jerusalem which is above is free: which is our mother. Brethren, we are not the children of the bondwoman, but of the free." }, g: { r: "Jn 6:1\u201315", t: "Jesus took the loaves, and when He had given thanks, He distributed to them that were set down." } },
  "Monday of the 4th Week of Lent": { e: { r: "3 Kgs 3:16\u201328", t: "Solomon said: Give the living child to the first woman, and do not kill it: she is the mother thereof." }, g: { r: "Jn 2:13\u201325", t: "Destroy this temple, and in three days I will raise it up. But He spoke of the temple of His body." } },
  "Tuesday of the 4th Week of Lent": { e: { r: "Ex 32:7\u201314", t: "The Lord was appeased from doing the evil which He had spoken against His people." }, g: { r: "Jn 7:14\u201331", t: "My doctrine is not Mine, but His that sent Me. If any man will do the will of Him, he shall know of the doctrine." } },
  "Wednesday of the 4th Week of Lent": { e: { r: "Ez 36:23\u201328", t: "I will pour upon you clean water, and you shall be cleansed. And I will give you a new heart, and put a new spirit within you." }, g: { r: "Jn 9:1\u201338", t: "As long as I am in the world, I am the light of the world. He made clay, and anointed his eyes. I went; I washed; and I see." } },
  "Thursday of the 4th Week of Lent": { e: { r: "4 Kgs 4:25\u201338", t: "Eliseus prayed to the Lord. And the child opened his eyes." }, g: { r: "Lk 7:11\u201316", t: "Young man, I say to thee, arise. And he that was dead sat up, and began to speak." } },
  "Friday of the 4th Week of Lent": { e: { r: "3 Kgs 17:17\u201324", t: "The Lord heard the voice of Elias: and the soul of the child returned into him, and he revived." }, g: { r: "Jn 11:1\u201345", t: "I am the resurrection and the life. He that believeth in Me, although he be dead, shall live. Lazarus, come forth!" } },
  "Saturday of the 4th Week of Lent": { e: { r: "Is 49:8\u201315", t: "Can a woman forget her infant? And if she should forget, yet will not I forget thee." }, g: { r: "Jn 8:12\u201320", t: "I am the light of the world. He that followeth Me walketh not in darkness, but shall have the light of life." } },
  "Passion Sunday": { e: { r: "Heb 9:11\u201315", t: "Christ, being come a High Priest of the good things to come, by His own blood entered once into the Holies, having obtained eternal redemption." }, g: { r: "Jn 8:46\u201359", t: "Which of you shall convince Me of sin? If I say the truth to you, why do you not believe Me? Abraham your father rejoiced that he might see My day." } },
  "Monday of Passion Week": { e: { r: "Jonas 3:1\u201310", t: "The men of Ninive believed in God: and they proclaimed a fast. And God had mercy with regard to the evil which He had said He would do to them." }, g: { r: "Jn 7:32\u201339", t: "Yet a little while I am with you, and then I go to Him that sent Me. He that believeth in Me, out of his belly shall flow rivers of living water." } },
  "Tuesday of Passion Week": { e: { r: "Dan 14:27\u201342", t: "Daniel was in the lions' den six days. And the Lord remembered Daniel, and the lions did not hurt him." }, g: { r: "Jn 7:1\u201313", t: "My time is not yet come; but your time is always ready." } },
  "Wednesday of Passion Week": { e: { r: "Lev 19:1\u20132,11\u201319", t: "Thou shalt love thy friend as thyself. I am the Lord." }, g: { r: "Jn 10:22\u201338", t: "I and the Father are one. The works that I do in the name of My Father, they give testimony of Me." } },
  "Thursday of Passion Week": { e: { r: "Dan 3:34\u201345", t: "Deliver us not up forever for the sake of Thy name, and abolish not Thy covenant." }, g: { r: "Lk 7:36\u201350", t: "Many sins are forgiven her, because she hath loved much. Thy faith hath made thee safe; go in peace." } },
  "Friday of Passion Week": { e: { r: "Jer 17:13\u201318", t: "Heal me, O Lord, and I shall be healed: save me, and I shall be saved: for Thou art my praise." }, g: { r: "Jn 11:47\u201354", t: "It is expedient for you that one man should die for the people. From that day therefore they devised to put Him to death." } },
  "Saturday of Passion Week": { e: { r: "Jer 18:18\u201323", t: "Give heed to me, O Lord, and hear the voice of my adversaries." }, g: { r: "Jn 12:10\u201336", t: "Unless the grain of wheat falling into the ground die, itself remaineth alone. But if it die, it bringeth forth much fruit." } },

  // ── HOLY WEEK ──
  "Palm Sunday": { e: { r: "Phil 2:5\u201311", t: "He humbled Himself, becoming obedient unto death, even to the death of the cross. For which cause God also hath exalted Him." }, g: { r: "Mt 26:1\u201327:66", t: "The Passion of our Lord Jesus Christ according to Saint Matthew." } },
  "Monday of Holy Week": { e: { r: "Is 50:5\u201310", t: "The Lord God hath opened my ear, and I do not resist: I have not gone back." }, g: { r: "Jn 12:1\u20139", t: "Mary took a pound of ointment of right spikenard, of great price, and anointed the feet of Jesus." } },
  "Tuesday of Holy Week": { e: { r: "Jer 11:18\u201320", t: "Thou, O Lord of Sabaoth, who judgest justly, and triest the reins and the hearts, let me see Thy revenge on them." }, g: { r: "Mk 14:1\u201315:46", t: "The Passion of our Lord Jesus Christ according to Saint Mark." } },
  "Wednesday of Holy Week": { e: { r: "Is 62:11\u201363:7", t: "I have trodden the winepress alone, and of the Gentiles there is not a man with Me." }, g: { r: "Lk 22:1\u201323:53", t: "The Passion of our Lord Jesus Christ according to Saint Luke." } },
  "Holy Thursday": { e: { r: "1 Cor 11:20\u201332", t: "The Lord Jesus, the same night in which He was betrayed, took bread, and giving thanks, broke it, and said: This is My Body." }, g: { r: "Jn 13:1\u201315", t: "He riseth from supper, and laid aside His garments, and began to wash the feet of the disciples." } },
  "Good Friday": { e: { r: "Ex 12:1\u201311; Heb 9", t: "The Lamb shall be without blemish. It is appointed unto men once to die, and after this the judgment." }, g: { r: "Jn 18:1\u201319:42", t: "The Passion of our Lord Jesus Christ according to Saint John." } },
  "Holy Saturday": { e: { r: "Col 3:1\u20134", t: "If you be risen with Christ, seek the things that are above, where Christ is sitting at the right hand of God." }, g: { r: "Mt 28:1\u20137", t: "He is not here, for He is risen, as He said. Come and see the place where the Lord was laid." } },

  // ── EASTER CYCLE ──
  "Easter Sunday": { e: { r: "1 Cor 5:7\u20138", t: "Purge out the old leaven, that you may be a new paste, as you are unleavened. For Christ our Pasch is sacrificed." }, g: { r: "Mk 16:1\u20137", t: "He is risen, He is not here; behold the place where they laid Him." } },
  "Monday in the Octave of Easter": { e: { r: "Acts 10:37\u201343", t: "God anointed Him with the Holy Ghost and with power. Him God raised up the third day." }, g: { r: "Lk 24:13\u201335", t: "Was not our heart burning within us, whilst He spoke in the way, and opened to us the Scriptures?" } },
  "Tuesday in the Octave of Easter": { e: { r: "Acts 13:16,26\u201333", t: "God hath fulfilled His promise, raising up Jesus, as in the second psalm also is written: Thou art My Son; this day have I begotten Thee." }, g: { r: "Lk 24:36\u201347", t: "See My hands and feet, that it is I Myself. Handle, and see: for a spirit hath not flesh and bones, as you see Me to have." } },
  "Wednesday in the Octave of Easter": { e: { r: "Acts 3:13\u201315,17\u201319", t: "The Author of life you killed, whom God hath raised from the dead: of which we are witnesses." }, g: { r: "Jn 21:1\u201314", t: "Jesus cometh and taketh bread and giveth them, and fish in like manner. This is now the third time that Jesus was manifested to His disciples." } },
  "Thursday in the Octave of Easter": { e: { r: "Acts 8:26\u201340", t: "Philip opened his mouth, and beginning from this Scripture, preached unto him Jesus." }, g: { r: "Jn 20:11\u201318", t: "Woman, why weepest thou? She saith: They have taken away my Lord. Jesus saith to her: Mary." } },
  "Friday in the Octave of Easter": { e: { r: "1 Pet 3:18\u201322", t: "Christ also died once for our sins, the just for the unjust, that He might offer us to God." }, g: { r: "Mt 28:16\u201320", t: "All power is given to Me in heaven and in earth. Going therefore, teach ye all nations." } },
  "Saturday in the Octave of Easter": { e: { r: "1 Pet 2:1\u201310", t: "You are a chosen generation, a kingly priesthood, a holy nation, a purchased people." }, g: { r: "Jn 20:1\u20139", t: "He saw, and believed. For as yet they knew not the Scripture, that He must rise again from the dead." } },
  "Low Sunday": { e: { r: "1 Jn 5:4\u201310", t: "This is the victory which overcometh the world, our faith. Who is he that overcometh the world but he that believeth that Jesus is the Son of God?" }, g: { r: "Jn 20:19\u201331", t: "Jesus came, the doors being shut, and stood in the midst, and said: Peace be to you. Blessed are they that have not seen, and have believed." } },
  "2nd Sunday after Easter": { e: { r: "1 Pet 2:21\u201325", t: "Christ suffered for us, leaving you an example, that you should follow His steps. Who, when He was reviled, did not revile." }, g: { r: "Jn 10:11\u201316", t: "I am the Good Shepherd. The good shepherd giveth his life for his sheep." } },
  "3rd Sunday after Easter": { e: { r: "1 Pet 2:11\u201319", t: "Dearly beloved, I beseech you as strangers and pilgrims, to refrain yourselves from carnal desires." }, g: { r: "Jn 16:16\u201322", t: "A little while, and now you shall not see Me. And again a little while, and you shall see Me: your sorrow shall be turned into joy." } },
  "4th Sunday after Easter": { e: { r: "Jas 1:17\u201321", t: "Every best gift, and every perfect gift, is from above, coming down from the Father of lights." }, g: { r: "Jn 16:5\u201314", t: "I tell you the truth: it is expedient to you that I go. For if I go not, the Paraclete will not come to you." } },
  "5th Sunday after Easter": { e: { r: "Jas 1:22\u201327", t: "Be ye doers of the word, and not hearers only, deceiving your own selves." }, g: { r: "Jn 16:23\u201330", t: "Amen, amen I say to you: if you ask the Father anything in My name, He will give it you." } },
  "Monday after the 2nd Sunday after Easter": { e: { r: "Acts 11:1\u201318", t: "God then hath also to the Gentiles given repentance unto life." }, g: { r: "Jn 10:1\u201310", t: "He that entereth not by the door into the sheepfold, but climbeth up another way, the same is a thief and a robber." } },
  "Tuesday after the 2nd Sunday after Easter": { e: { r: "Acts 12:24\u201313:5", t: "The Holy Ghost said to them: Separate me Saul and Barnabas for the work whereunto I have taken them." }, g: { r: "Jn 10:22\u201330", t: "My sheep hear My voice: and I know them, and they follow Me. And I give them life everlasting." } },
  "Wednesday after the 2nd Sunday after Easter": { e: { r: "Acts 13:13\u201325", t: "Of David's seed God according to His promise hath raised to Israel a Saviour, Jesus." }, g: { r: "Jn 12:44\u201350", t: "He that believeth in Me, doth not believe in Me, but in Him that sent Me." } },
  "Thursday after the 2nd Sunday after Easter": { e: { r: "Acts 13:26\u201333", t: "God hath fulfilled His promise to our children, raising up Jesus." }, g: { r: "Jn 14:1\u20136", t: "I am the way, and the truth, and the life. No man cometh to the Father, but by Me." } },
  "Friday after the 2nd Sunday after Easter": { e: { r: "Acts 13:44\u201352", t: "It was necessary that the word of God should first have been spoken to you; but because you reject it, behold we turn to the Gentiles." }, g: { r: "Jn 14:7\u201314", t: "He that seeth Me seeth the Father also. The works that I do, he also shall do; and greater than these shall he do." } },
  "Saturday after the 2nd Sunday after Easter": { e: { r: "Acts 14:1\u20137", t: "They abode a long time, speaking boldly in the Lord, who gave testimony to the word of His grace." }, g: { r: "Jn 14:15\u201321", t: "If you love Me, keep My commandments. And I will ask the Father, and He shall give you another Paraclete." } },
  "Monday after the 3rd Sunday after Easter": { e: { r: "Acts 14:18\u201327", t: "They preached the Gospel, and exhorted them to continue in the grace of God." }, g: { r: "Jn 14:27\u201331", t: "Peace I leave with you, My peace I give unto you: not as the world giveth, do I give unto you." } },
  "Tuesday after the 3rd Sunday after Easter": { e: { r: "Acts 15:1\u20136", t: "Paul and Barnabas went up to Jerusalem to the apostles and ancients about this question." }, g: { r: "Jn 15:1\u20137", t: "I am the true vine, and My Father is the husbandman. Abide in Me, and I in you." } },
  "Wednesday after the 3rd Sunday after Easter": { e: { r: "Acts 15:7\u201321", t: "We believe that through the grace of the Lord Jesus Christ we shall be saved, even as they." }, g: { r: "Jn 15:7\u201311", t: "If you abide in Me, and My words abide in you, you shall ask whatever you will, and it shall be done unto you." } },
  "Thursday after the 3rd Sunday after Easter": { e: { r: "Acts 15:22\u201331", t: "It hath seemed good to the Holy Ghost and to us, to lay no further burden upon you." }, g: { r: "Jn 15:12\u201316", t: "This is My commandment, that you love one another, as I have loved you." } },
  "Friday after the 3rd Sunday after Easter": { e: { r: "Acts 16:1\u201310", t: "The spirit of Jesus suffered them not. A vision appeared to Paul: Come over into Macedonia, and help us." }, g: { r: "Jn 15:17\u201321", t: "These things I command you, that you love one another. If the world hate you, know ye that it hath hated Me before you." } },
  "Saturday after the 3rd Sunday after Easter": { e: { r: "Acts 16:11\u201315", t: "A certain woman named Lydia, a seller of purple, whose heart the Lord opened to attend to those things which were said by Paul." }, g: { r: "Jn 15:26\u201316:4", t: "When the Paraclete cometh, He shall give testimony of Me: and you also shall give testimony." } },
  "Monday after the 4th Sunday after Easter": { e: { r: "Acts 16:22\u201334", t: "At midnight Paul and Silas praying, praised God. And the foundations of the prison were shaken." }, g: { r: "Jn 16:5\u201311", t: "If I go not, the Paraclete will not come to you; but if I go, I will send Him to you." } },
  "Tuesday after the 4th Sunday after Easter": { e: { r: "Acts 17:15\u201334", t: "In Him we live, and move, and are. God now declareth unto men, that all should everywhere do penance." }, g: { r: "Jn 16:12\u201315", t: "When He, the Spirit of truth, is come, He will teach you all truth." } },
  "Wednesday after the 4th Sunday after Easter": { e: { r: "Acts 18:1\u20138", t: "Many of the Corinthians hearing, believed and were baptized." }, g: { r: "Jn 16:16\u201320", t: "A little while, and now you shall not see Me; and again a little while, and you shall see Me." } },
  "Thursday after the 4th Sunday after Easter": { e: { r: "Acts 18:23\u201328", t: "Apollos, being fervent in spirit, spoke and taught diligently the things that are of Jesus." }, g: { r: "Jn 16:20\u201323", t: "Your sorrow shall be turned into joy. And your joy no man shall take from you." } },
  "Friday after the 4th Sunday after Easter": { e: { r: "Acts 19:1\u20138", t: "Have you received the Holy Ghost since ye believed? And Paul imposing his hands on them, the Holy Ghost came upon them." }, g: { r: "Jn 16:23\u201328", t: "Amen, amen I say to you: if you ask the Father anything in My name, He will give it you." } },
  "Saturday after the 4th Sunday after Easter": { e: { r: "Acts 20:7\u201312", t: "Paul preached unto them, being to depart on the morrow, and he continued his speech until midnight." }, g: { r: "Jn 16:28\u201333", t: "I came forth from the Father, and am come into the world: again I leave the world, and I go to the Father." } },
  "Monday after the 5th Sunday after Easter": { e: { r: "Acts 20:17\u201327", t: "I have not spared to declare unto you all the counsel of God." }, g: { r: "Jn 17:1\u201311", t: "Father, the hour is come: glorify Thy Son. This is eternal life: that they may know Thee, the only true God." } },
  "Tuesday after the 5th Sunday after Easter": { e: { r: "Acts 20:28\u201338", t: "Take heed to yourselves and to the whole flock. It is a more blessed thing to give, rather than to receive." }, g: { r: "Jn 17:11\u201319", t: "Holy Father, keep them in Thy name. Sanctify them in truth. Thy word is truth." } },
  "Wednesday after the 5th Sunday after Easter": { e: { r: "Acts 21:1\u201314", t: "The will of the Lord be done." }, g: { r: "Jn 17:20\u201326", t: "That they all may be one, as Thou, Father, in Me, and I in Thee: that they also may be one in Us." } },
  "Friday after the Ascension": { e: { r: "Acts 25:13\u201321", t: "Paul appealed to be reserved unto the hearing of Augustus." }, g: { r: "Jn 16:20\u201323", t: "You shall be made sorrowful, but your sorrow shall be turned into joy." } },
  "Saturday after the Ascension": { e: { r: "Acts 28:16\u201320,30\u201331", t: "Paul remained two whole years, preaching the kingdom of God, and teaching the things which concern the Lord Jesus Christ." }, g: { r: "Jn 21:20\u201325", t: "This is that disciple who giveth testimony of these things, and hath written these things; and we know that his testimony is true." } },
  "Ascension of Our Lord": { e: { r: "Acts 1:1\u201311", t: "He was raised up, and a cloud received Him out of their sight. This Jesus shall so come as you have seen Him going into heaven." }, g: { r: "Mk 16:14\u201320", t: "Go ye into the whole world and preach the Gospel to every creature." } },
  "Sunday after the Ascension": { e: { r: "1 Pet 4:7\u201311", t: "Be prudent and watch in prayers. But before all things have a mutual charity among yourselves." }, g: { r: "Jn 15:26\u201316:4", t: "When the Paraclete cometh, whom I will send you from the Father, the Spirit of truth, He shall give testimony of Me." } },
  "Pentecost Sunday": { e: { r: "Acts 2:1\u201311", t: "They were all filled with the Holy Ghost, and they began to speak with divers tongues, according as the Holy Ghost gave them to speak." }, g: { r: "Jn 14:23\u201331", t: "If any one love Me, he will keep My word. The Paraclete, the Holy Ghost, whom the Father will send in My name, He will teach you all things." } },
  "Trinity Sunday": { e: { r: "Rom 11:33\u201336", t: "O the depth of the riches of the wisdom and of the knowledge of God! How incomprehensible are His judgments, and how unsearchable His ways!" }, g: { r: "Mt 28:18\u201320", t: "Going therefore, teach ye all nations: baptizing them in the name of the Father, and of the Son, and of the Holy Ghost." } },
  "Corpus Christi": { e: { r: "1 Cor 11:23\u201329", t: "As often as you shall eat this bread and drink the chalice, you shall show the death of the Lord, until He come." }, g: { r: "Jn 6:56\u201359", t: "My Flesh is meat indeed, and My Blood is drink indeed. He that eateth My Flesh and drinketh My Blood abideth in Me, and I in him." } },

  // ── AFTER PENTECOST (all Sundays) ──
  "2nd Sunday after Pentecost": { e: { r: "1 Jn 3:13\u201318", t: "We know that we have passed from death to life, because we love the brethren." }, g: { r: "Lk 14:16\u201324", t: "A certain man made a great supper and invited many. Come, for now all things are ready." } },
  "3rd Sunday after Pentecost": { e: { r: "1 Pet 5:6\u201311", t: "Casting all your care upon Him, for He hath care of you. Be sober and watch." }, g: { r: "Lk 15:1\u201310", t: "There shall be joy in heaven upon one sinner that doth penance, more than upon ninety-nine just." } },
  "4th Sunday after Pentecost": { e: { r: "Rom 8:18\u201323", t: "The sufferings of this time are not worthy to be compared with the glory to come, that shall be revealed in us." }, g: { r: "Lk 5:1\u201311", t: "Put out into the deep, and let down your nets for a draught. Master, at Thy word I will let down the net." } },
  "5th Sunday after Pentecost": { e: { r: "1 Pet 3:8\u201315", t: "Be ye all of one mind, having compassion one of another. Sanctify the Lord Christ in your hearts." }, g: { r: "Mt 5:20\u201324", t: "Unless your justice abound more than that of the scribes and Pharisees, you shall not enter into the kingdom of heaven." } },
  "6th Sunday after Pentecost": { e: { r: "Rom 6:3\u201311", t: "We are buried together with Him by baptism into death, that as Christ is risen from the dead, so we also may walk in newness of life." }, g: { r: "Mk 8:1\u20139", t: "I have compassion on the multitude. He took the seven loaves, and giving thanks, broke and gave to His disciples." } },
  "7th Sunday after Pentecost": { e: { r: "Rom 6:19\u201323", t: "The wages of sin is death. But the grace of God, life everlasting, in Christ Jesus our Lord." }, g: { r: "Mt 7:15\u201321", t: "Beware of false prophets. By their fruits you shall know them. Not every one that saith to Me, Lord, Lord, shall enter into the kingdom." } },
  "8th Sunday after Pentecost": { e: { r: "Rom 8:12\u201317", t: "If you live according to the flesh, you shall die; but if by the Spirit you mortify the deeds of the flesh, you shall live." }, g: { r: "Lk 16:1\u20139", t: "The lord commended the unjust steward. Make unto you friends of the mammon of iniquity." } },
  "9th Sunday after Pentecost": { e: { r: "1 Cor 10:6\u201313", t: "Let him that thinketh himself to stand, take heed lest he fall. God is faithful, who will not suffer you to be tempted above that which you are able." }, g: { r: "Lk 19:41\u201347", t: "When He drew near, seeing the city, He wept over it. My house is the house of prayer; but you have made it a den of thieves." } },
  "10th Sunday after Pentecost": { e: { r: "1 Cor 12:2\u201311", t: "There are diversities of graces, but the same Spirit. The manifestation of the Spirit is given to every man unto profit." }, g: { r: "Lk 18:9\u201314", t: "The publican, standing afar off, would not so much as lift up his eyes towards heaven; but struck his breast, saying: O God, be merciful to me a sinner." } },
  "11th Sunday after Pentecost": { e: { r: "1 Cor 15:1\u201310", t: "I delivered unto you first of all, that Christ died for our sins, and that He was buried, and that He rose again the third day." }, g: { r: "Mk 7:31\u201337", t: "He hath done all things well; He hath made both the deaf to hear, and the dumb to speak." } },
  "12th Sunday after Pentecost": { e: { r: "2 Cor 3:4\u20139", t: "The letter killeth, but the spirit quickeneth. The ministration of the spirit is in glory." }, g: { r: "Lk 10:23\u201337", t: "A certain man went down from Jerusalem to Jericho. Which of these three was neighbor unto him? Go, and do thou in like manner." } },
  "13th Sunday after Pentecost": { e: { r: "Gal 3:16\u201322", t: "The promises were made to Abraham and to his seed. He saith not: And to his seeds, as of many: but as of one: And to thy seed, which is Christ." }, g: { r: "Lk 17:11\u201319", t: "Were not ten made clean? And where are the nine? There is no one found to return and give glory to God, but this stranger." } },
  "14th Sunday after Pentecost": { e: { r: "Gal 5:16\u201324", t: "Walk in the spirit, and you shall not fulfil the lusts of the flesh. The fruit of the Spirit is charity, joy, peace, patience." }, g: { r: "Mt 6:24\u201333", t: "No man can serve two masters. Seek ye first the kingdom of God and His justice, and all these things shall be added unto you." } },
  "15th Sunday after Pentecost": { e: { r: "Gal 5:25\u20136:10", t: "Bear ye one another's burdens, and so you shall fulfil the law of Christ." }, g: { r: "Lk 7:11\u201316", t: "Young man, I say to thee, Arise. And he that was dead sat up and began to speak." } },
  "16th Sunday after Pentecost": { e: { r: "Eph 3:13\u201321", t: "I bow my knees to the Father of our Lord Jesus Christ, that He would grant you to be strengthened by His Spirit with might unto the inward man." }, g: { r: "Lk 14:1\u201311", t: "Every one that exalteth himself shall be humbled; and he that humbleth himself shall be exalted." } },
  "17th Sunday after Pentecost": { e: { r: "Eph 4:1\u20136", t: "Walk worthy of the vocation in which you are called, with all humility and mildness: one Lord, one faith, one baptism." }, g: { r: "Mt 22:34\u201346", t: "Thou shalt love the Lord thy God with thy whole heart. This is the greatest and the first commandment." } },
  "18th Sunday after Pentecost": { e: { r: "1 Cor 1:4\u20138", t: "I give thanks to my God always for you, for the grace of God that is given you in Christ Jesus." }, g: { r: "Mt 9:1\u20138", t: "That you may know that the Son of man hath power on earth to forgive sins. Arise, take up thy bed, and go into thy house." } },
  "19th Sunday after Pentecost": { e: { r: "Eph 4:23\u201328", t: "Be renewed in the spirit of your mind: and put on the new man, who according to God is created in justice and holiness of truth." }, g: { r: "Mt 22:1\u201314", t: "The kingdom of heaven is likened to a king who made a marriage for his son. Many are called, but few are chosen." } },
  "20th Sunday after Pentecost": { e: { r: "Eph 5:15\u201321", t: "See therefore, brethren, how you walk circumspectly: not as unwise, but as wise: redeeming the time, because the days are evil." }, g: { r: "Jn 4:46\u201353", t: "Go thy way; thy son liveth. The man believed the word which Jesus said to him, and went his way." } },
  "21st Sunday after Pentecost": { e: { r: "Eph 6:10\u201317", t: "Put you on the armour of God, that you may be able to stand against the deceits of the devil." }, g: { r: "Mt 18:23\u201335", t: "The kingdom of heaven is likened to a king who would take an account of his servants. Shouldst not thou then have had compassion also on thy fellow servant?" } },
  "22nd Sunday after Pentecost": { e: { r: "Phil 1:6\u201311", t: "He who hath begun a good work in you will perfect it unto the day of Christ Jesus." }, g: { r: "Mt 22:15\u201321", t: "Render therefore to Caesar the things that are Caesar's; and to God, the things that are God's." } },
  "23rd Sunday after Pentecost": { e: { r: "Phil 3:17\u20134:3", t: "Our conversation is in heaven, from whence also we look for the Saviour, our Lord Jesus Christ." }, g: { r: "Mt 9:18\u201326", t: "The ruler said: My daughter is even now dead; but come, lay Thy hand upon her, and she shall live." } },
  "24th Sunday after Pentecost": { e: { r: "Col 1:9\u201314", t: "We cease not to pray for you and to beg that you may be filled with the knowledge of His will, in all wisdom and spiritual understanding." }, g: { r: "Mt 24:15\u201335", t: "Heaven and earth shall pass, but My words shall not pass." } },
  "25th Sunday after Pentecost": { e: { r: "Col 1:9\u201314", t: "We cease not to pray for you and to beg that you may be filled with the knowledge of His will, in all wisdom and spiritual understanding." }, g: { r: "Mt 24:15\u201335", t: "Heaven and earth shall pass, but My words shall not pass." } },
  "26th Sunday after Pentecost": { e: { r: "Col 1:9\u201314", t: "We cease not to pray for you and to beg that you may be filled with the knowledge of His will, in all wisdom and spiritual understanding." }, g: { r: "Mt 24:15\u201335", t: "Heaven and earth shall pass, but My words shall not pass." } },
  "27th Sunday after Pentecost": { e: { r: "Col 1:9\u201314", t: "We cease not to pray for you and to beg that you may be filled with the knowledge of His will, in all wisdom and spiritual understanding." }, g: { r: "Mt 24:15\u201335", t: "Heaven and earth shall pass, but My words shall not pass." } },

  // ── ADVENT ──
  "First Sunday of Advent": { e: { r: "Rom 13:11\u201314", t: "It is now the hour for us to rise from sleep. The night is passed, and the day is at hand. Let us put on the armour of light." }, g: { r: "Lk 21:25\u201333", t: "There shall be signs in the sun, and in the moon, and in the stars. When these things begin to come to pass, look up, and lift up your heads." } },
  "Monday of the 1st Week of Advent": { e: { r: "Is 2:1\u20135", t: "In the last days the mountain of the house of the Lord shall be prepared on the top of mountains, and all nations shall flow unto it." }, g: { r: "Mt 8:5\u201311", t: "Many shall come from the east and the west, and shall sit down with Abraham, and Isaac, and Jacob in the kingdom of heaven." } },
  "Tuesday of the 1st Week of Advent": { e: { r: "Is 11:1\u20135", t: "There shall come forth a rod out of the root of Jesse, and a flower shall rise up out of his root. And the Spirit of the Lord shall rest upon Him." }, g: { r: "Lk 10:21\u201324", t: "Blessed are the eyes that see the things which you see." } },
  "Wednesday of the 1st Week of Advent": { e: { r: "Is 25:6\u201310", t: "The Lord of hosts shall make unto all people a feast of fat things. He shall cast death down headlong for ever." }, g: { r: "Mt 15:32\u201337", t: "I have compassion on the multitudes. He took the seven loaves, and giving thanks, broke and gave to His disciples." } },
  "Thursday of the 1st Week of Advent": { e: { r: "Is 26:1\u20136", t: "Open ye the gates, and let the just nation that keepeth the truth enter in. Thou wilt keep peace, because we have hoped in Thee." }, g: { r: "Mt 7:21,24\u201327", t: "Every one that heareth these My words, and doth them, shall be likened to a wise man that built his house upon a rock." } },
  "Friday of the 1st Week of Advent": { e: { r: "Is 29:17\u201324", t: "In that day the deaf shall hear the words of the book, and out of darkness the eyes of the blind shall see." }, g: { r: "Mt 9:27\u201335", t: "Two blind men followed Him, crying out: Have mercy on us, O Son of David. And their eyes were opened." } },
  "Saturday of the 1st Week of Advent": { e: { r: "Is 30:19\u201321,23\u201326", t: "Thy eyes shall see thy Teacher. This is the way, walk ye in it." }, g: { r: "Mt 9:35\u201310:1,6\u20138", t: "The harvest indeed is great, but the labourers are few. Pray ye the Lord of the harvest." } },
  "Ember Wednesday of Advent": { e: { r: "Is 2:2\u20135", t: "In the last days the mountain of the house of the Lord shall be exalted above all hills, and all nations shall flow unto it." }, g: { r: "Lk 1:26\u201338", t: "The angel said unto her: Fear not, Mary, for thou hast found grace with God." } },
  "Ember Friday of Advent": { e: { r: "Is 11:1\u20135", t: "There shall come forth a rod out of the root of Jesse, and a flower shall rise up out of his root." }, g: { r: "Lk 1:39\u201347", t: "And whence is this to me, that the mother of my Lord should come to me?" } },
  "Ember Saturday of Advent": { e: { r: "2 Thess 2:1\u20138", t: "Let no man deceive you by any means. Unless there come a revolt first, and the man of sin be revealed." }, g: { r: "Lk 3:1\u20136", t: "The word of the Lord was made unto John, the son of Zachary, in the desert." } },
  "Second Sunday of Advent": { e: { r: "Rom 15:4\u201313", t: "What things soever were written, were written for our learning: that through patience and the comfort of the Scriptures, we might have hope." }, g: { r: "Mt 11:2\u201310", t: "Art Thou He that art to come, or look we for another? Go and relate to John what you have heard and seen." } },
  "Monday of the 2nd Week of Advent": { e: { r: "Is 35:1\u201310", t: "The desert shall rejoice, and shall flourish like the lily. Behold your God will bring the revenge of recompense: God Himself will come and will save you." }, g: { r: "Lk 5:17\u201326", t: "That you may know that the Son of man hath power on earth to forgive sins — He saith to the sick of the palsy — arise, take up thy bed." } },
  "Tuesday of the 2nd Week of Advent": { e: { r: "Is 40:1\u201311", t: "Comfort ye, comfort ye My people, saith your God. The voice of one crying in the desert: Prepare ye the way of the Lord." }, g: { r: "Mt 18:12\u201318", t: "It is not the will of your Father, who is in heaven, that one of these little ones should perish." } },
  "Wednesday of the 2nd Week of Advent": { e: { r: "Is 40:25\u201331", t: "They that hope in the Lord shall renew their strength, they shall take wings as eagles." }, g: { r: "Mt 11:28\u201330", t: "Come to Me, all you that labour, and are burdened, and I will refresh you. Learn of Me, because I am meek and humble of heart." } },
  "Thursday of the 2nd Week of Advent": { e: { r: "Is 41:13\u201320", t: "I am the Lord thy God, who take thee by the hand, and say to thee: Fear not, I have helped thee." }, g: { r: "Mt 11:11\u201315", t: "There hath not risen among them that are born of women a greater than John the Baptist." } },
  "Friday of the 2nd Week of Advent": { e: { r: "Is 48:17\u201319", t: "I am the Lord thy God that teach thee profitable things, that govern thee in the way that thou walkest." }, g: { r: "Mt 11:16\u201319", t: "But whereunto shall I esteem this generation to be like? Wisdom is justified by her children." } },
  "Saturday of the 2nd Week of Advent": { e: { r: "Ecclus 48:1\u20134,9\u201311", t: "Elias arose as a fire, and his word burnt like a torch." }, g: { r: "Mt 17:10\u201313", t: "Elias indeed shall come, and restore all things. But I say to you, that Elias is already come." } },
  "Third Sunday of Advent": { e: { r: "Phil 4:4\u20137", t: "Rejoice in the Lord always; again, I say, rejoice. The Lord is nigh." }, g: { r: "Jn 1:19\u201328", t: "I am the voice of one crying in the wilderness: Make straight the way of the Lord." } },
  "Monday of the 3rd Week of Advent": { e: { r: "Is 45:1\u20138", t: "Drop down dew, ye heavens, from above, and let the clouds rain the Just One. Let the earth be opened, and bud forth a Saviour." }, g: { r: "Lk 1:57\u201368", t: "The hand of the Lord was with him. And Zachary his father was filled with the Holy Ghost, and he prophesied." } },
  "Tuesday of the 3rd Week of Advent": { e: { r: "Is 54:1\u201310", t: "With everlasting kindness have I had mercy on thee, said the Lord thy Redeemer." }, g: { r: "Mt 1:1\u201317", t: "The book of the generation of Jesus Christ, the son of David, the son of Abraham." } },
  "Wednesday of the 3rd Week of Advent": { e: { r: "Is 56:1\u20133,6\u20138", t: "My house shall be called the house of prayer for all nations." }, g: { r: "Jn 5:33\u201336", t: "John was a burning and a shining light. But I have a greater testimony than that of John." } },
  "Thursday of the 3rd Week of Advent": { e: { r: "Is 60:1\u20136", t: "Arise, be enlightened, O Jerusalem: for thy light is come, and the glory of the Lord is risen upon thee." }, g: { r: "Lk 7:18\u201323", t: "Go and relate to John what you have heard and seen: the blind see, the lame walk, the lepers are cleansed." } },
  "Friday of the 3rd Week of Advent": { e: { r: "Is 61:1\u20133", t: "The Spirit of the Lord is upon me, because the Lord hath anointed me. He hath sent me to preach to the meek, to heal the contrite of heart." }, g: { r: "Jn 5:37\u201347", t: "Search the Scriptures, for you think in them to have life everlasting; and the same are they that give testimony of Me." } },
  "Saturday of the 3rd Week of Advent": { e: { r: "Is 7:10\u201315", t: "Behold a Virgin shall conceive and bear a son, and His name shall be called Emmanuel." }, g: { r: "Lk 1:26\u201338", t: "Behold thou shalt conceive in thy womb, and shalt bring forth a son, and thou shalt call His name Jesus." } },
  "Fourth Sunday of Advent": { e: { r: "1 Cor 4:1\u20135", t: "Let a man so account of us as of the ministers of Christ, and the dispensers of the mysteries of God." }, g: { r: "Lk 3:1\u20136", t: "The word of the Lord was made unto John, the son of Zachary, in the desert. Every valley shall be filled, and every mountain shall be brought low." } },
  "Monday of the 4th Week of Advent": { e: { r: "Is 11:1\u20135", t: "There shall come forth a rod out of the root of Jesse. The Spirit of the Lord shall rest upon Him: the spirit of wisdom and of understanding." }, g: { r: "Lk 1:5\u201325", t: "There was in the days of Herod a certain priest named Zachary. The angel said to him: Fear not, Zachary, for thy prayer is heard." } },
  "Tuesday of the 4th Week of Advent": { e: { r: "Is 7:10\u201315", t: "The Lord Himself shall give you a sign. Behold a Virgin shall conceive, and bear a son, and His name shall be called Emmanuel." }, g: { r: "Lk 1:26\u201338", t: "The angel Gabriel was sent from God to a virgin. Hail, full of grace, the Lord is with thee." } },
  "Wednesday of the 4th Week of Advent": { e: { r: "Is 33:17\u201322", t: "Thine eyes shall see the King in His beauty, they shall see the land far off." }, g: { r: "Lk 1:39\u201347", t: "Mary rising up with haste went into the hill country. Blessed art thou among women, and blessed is the fruit of thy womb." } },
  "Thursday of the 4th Week of Advent": { e: { r: "Is 49:1\u20136", t: "The Lord hath called me from the womb. I will make thee the light of the Gentiles, that thou mayst be My salvation even to the farthest part of the earth." }, g: { r: "Lk 1:46\u201355", t: "My soul doth magnify the Lord. He hath put down the mighty from their seat, and hath exalted the humble." } },
  "Friday of the 4th Week of Advent": { e: { r: "Is 11:1\u20135", t: "A rod out of the root of Jesse. He shall not judge according to the sight of the eyes, nor reprove according to the hearing of the ears." }, g: { r: "Lk 1:46\u201356", t: "He that is mighty hath done great things to me; and holy is His name. And His mercy is from generation unto generations." } },
  "Saturday of the 4th Week of Advent": { e: { r: "Is 35:1\u20137", t: "The wilderness and the dry land shall be glad; and the desert shall rejoice and blossom as the rose." }, g: { r: "Lk 3:1\u20136", t: "In the fifteenth year of the reign of Tiberius Caesar, the word of the Lord was made unto John in the desert." } },

  // ── MAJOR FEASTS ──
  "Purification of the B.V.M.": { e: { r: "Mal 3:1\u20134", t: "Behold I send My angel, and he shall prepare the way before My face. And presently the Lord, whom you seek, shall come to His temple." }, g: { r: "Lk 2:22\u201332", t: "A light to the revelation of the Gentiles, and the glory of Thy people Israel." } },
  "Chair of St. Peter": { e: { r: "1 Pet 1:1\u20137", t: "Peter, an apostle of Jesus Christ, to the strangers. That the trial of your faith, much more precious than gold, might be found unto praise and glory." }, g: { r: "Mt 16:13\u201319", t: "Thou art Peter; and upon this rock I will build My Church, and the gates of hell shall not prevail against it." } },
  "St. Joseph, Spouse of the B.V.M.": { e: { r: "Ecclus 45:1\u20136", t: "He made him like to the glorious saints, and magnified him in the fear of his enemies." }, g: { r: "Mt 1:18\u201321", t: "Joseph, son of David, fear not to take unto thee Mary thy wife, for that which is conceived in her is of the Holy Ghost." } },
  "Annunciation of the B.V.M.": { e: { r: "Is 7:10\u201315", t: "Behold a Virgin shall conceive, and bear a son, and His name shall be called Emmanuel." }, g: { r: "Lk 1:26\u201338", t: "The Holy Ghost shall come upon thee, and the power of the Most High shall overshadow thee." } },
  "St. Joseph the Worker": { e: { r: "Col 3:14\u201315,17,23\u201324", t: "Whatsoever you do in word or in work, all things do ye in the name of the Lord Jesus Christ, giving thanks to God the Father by Him." }, g: { r: "Mt 13:54\u201358", t: "Is not this the carpenter's son? Is not His mother called Mary? And they were scandalized in His regard." } },
  "Nativity of St. John the Baptist": { e: { r: "Is 49:1\u20133,5\u20137", t: "The Lord hath called me from the womb. He said: It is a small thing that thou shouldst be My servant. I will make thee the light of the Gentiles." }, g: { r: "Lk 1:57\u201368,80", t: "The hand of the Lord was with him. His name is John. Thou, child, shalt be called the prophet of the Highest." } },
  "Sts. Peter & Paul": { e: { r: "Acts 12:1\u201311", t: "The Lord sent His angel, and hath delivered me out of the hand of Herod, and from all the expectation of the people of the Jews." }, g: { r: "Mt 16:13\u201319", t: "Thou art Peter; and upon this rock I will build My Church. I will give to thee the keys of the kingdom of heaven." } },
  "Precious Blood of Our Lord": { e: { r: "Heb 9:11\u201315", t: "Christ, being come a High Priest of the good things to come, by His own blood entered once into the Holies, having obtained eternal redemption." }, g: { r: "Jn 19:30\u201335", t: "One of the soldiers with a spear opened His side, and immediately there came out blood and water." } },
  "St. James, Apostle": { e: { r: "Eph 1:17\u201321", t: "The God of our Lord Jesus Christ, the Father of glory, may give unto you the spirit of wisdom and of revelation." }, g: { r: "Mt 20:20\u201323", t: "Can you drink the chalice that I shall drink? They say to Him: We can." } },
  "Transfiguration of Our Lord": { e: { r: "2 Pet 1:16\u201319", t: "We were eyewitnesses of His majesty. This is My beloved Son, in whom I am well pleased; hear ye Him." }, g: { r: "Mt 17:1\u20139", t: "His face did shine as the sun: and His garments became white as snow. This is My beloved Son; hear ye Him." } },
  "Assumption of the B.V.M.": { e: { r: "Judith 13:22\u201325; 15:10", t: "The Lord hath blessed thee by His power, because by thee He hath brought our enemies to nought." }, g: { r: "Lk 1:41\u201350", t: "My soul doth magnify the Lord. He that is mighty hath done great things to me; and holy is His name." } },
  "Nativity of the B.V.M.": { e: { r: "Prov 8:22\u201335", t: "The Lord possessed me in the beginning of His ways. When He prepared the heavens, I was present." }, g: { r: "Mt 1:1\u201316", t: "The book of the generation of Jesus Christ, the son of David, the son of Abraham." } },
  "Exaltation of the Holy Cross": { e: { r: "Phil 2:5\u201311", t: "He humbled Himself, becoming obedient unto death, even to the death of the cross. Wherefore God also hath exalted Him." }, g: { r: "Jn 12:31\u201336", t: "And I, if I be lifted up from the earth, will draw all things to Myself." } },
  "St. Michael the Archangel": { e: { r: "Apoc 1:1\u20135", t: "God sent His angel to His servant John. Grace be unto you and peace from Jesus Christ, the faithful witness." }, g: { r: "Mt 18:1\u201310", t: "See that you despise not one of these little ones: for their angels in heaven always see the face of My Father." } },
  "Our Lady of the Rosary": { e: { r: "Prov 8:22\u201335", t: "The Lord possessed me in the beginning of His ways, before He made anything. When He prepared the heavens, I was present." }, g: { r: "Lk 1:26\u201328", t: "The angel being come in, said unto her: Hail, full of grace, the Lord is with thee." } },
  "Christ the King": { e: { r: "Col 1:12\u201320", t: "He is the image of the invisible God, the firstborn of every creature. In Him, it hath well pleased the Father that all fulness should dwell." }, g: { r: "Jn 18:33\u201337", t: "Pilate said: Art Thou a king then? Jesus answered: My kingdom is not of this world. For this was I born: that I should give testimony to the truth." } },
  "All Saints": { e: { r: "Apoc 7:2\u201312", t: "I saw a great multitude, which no man could number, of all nations, standing before the throne and in sight of the Lamb, clothed with white robes." }, g: { r: "Mt 5:1\u201312", t: "Blessed are the poor in spirit: for theirs is the kingdom of heaven." } },
  "All Souls": { e: { r: "1 Cor 15:51\u201357", t: "We shall all indeed rise again. Death is swallowed up in victory. O death, where is thy victory? O death, where is thy sting?" }, g: { r: "Jn 5:25\u201329", t: "The hour cometh, wherein all that are in the graves shall hear the voice of the Son of God." } },
  "Immaculate Conception": { e: { r: "Prov 8:22\u201335", t: "The Lord possessed me in the beginning of His ways, before He made anything from the beginning." }, g: { r: "Lk 1:26\u201328", t: "The angel being come in, said unto her: Hail, full of grace, the Lord is with thee: blessed art thou among women." } },
  "Sacred Heart of Jesus": { e: { r: "Eph 3:8\u201312,14\u201319", t: "To me, the least of all the saints, is given this grace, to enlighten all men. To know also the charity of Christ, which surpasseth all knowledge." }, g: { r: "Jn 19:31\u201337", t: "One of the soldiers with a spear opened His side, and immediately there came out blood and water." } },
  "St. Anthony of Padua": { e: { r: "1 Tim 4:8\u201316", t: "Piety is profitable to all things, having promise of the life that now is, and of that which is to come." }, g: { r: "Lk 10:1\u20139", t: "The harvest indeed is great, but the labourers are few. Pray ye therefore the Lord of the harvest, that He send labourers." } },
  "St. Francis of Assisi": { e: { r: "Gal 6:14\u201318", t: "God forbid that I should glory, save in the cross of our Lord Jesus Christ; by whom the world is crucified to me, and I to the world." }, g: { r: "Mt 11:25\u201330", t: "I confess to Thee, O Father, because Thou hast hid these things from the wise, and hast revealed them to little ones." } },
  "St. Thérèse of the Child Jesus": { e: { r: "Ecclus 39:7\u201314", t: "He shall pour forth the words of his wisdom as showers, and in his prayer he shall confess to the Lord." }, g: { r: "Mt 18:1\u20134", t: "Unless you be converted, and become as little children, you shall not enter into the kingdom of heaven." } },
  "Guardian Angels": { e: { r: "Ex 23:20\u201323", t: "Behold I will send My angel, who shall go before thee, and keep thee in thy journey, and bring thee into the place that I have prepared." }, g: { r: "Mt 18:1\u201310", t: "See that you despise not one of these little ones: for I say to you, that their angels in heaven always see the face of My Father." } },

  // ── CHRISTMASTIDE WEEKDAYS ──
  "Monday in Christmastide": { e: { r: "Gal 4:1\u20137", t: "When the fulness of the time was come, God sent His Son, made of a woman, that we might receive the adoption of sons." }, g: { r: "Lk 2:15\u201320", t: "The shepherds said one to another: Let us go over to Bethlehem. And they found Mary, Joseph, and the Infant lying in the manger." } },
  "Tuesday in Christmastide": { e: { r: "Tit 3:4\u20137", t: "The goodness and kindness of God our Saviour appeared: not by the works of justice which we have done, but according to His mercy, He saved us." }, g: { r: "Lk 2:21\u201332", t: "They brought Him to Jerusalem to present Him to the Lord. A light to the revelation of the Gentiles." } },
  "Wednesday in Christmastide": { e: { r: "Heb 1:1\u20136", t: "God, who at sundry times spoke in times past to the fathers by the prophets, last of all hath spoken to us by His Son." }, g: { r: "Jn 1:1\u201318", t: "In the beginning was the Word. And the Word was made flesh, and dwelt among us." } },
  "Thursday in Christmastide": { e: { r: "1 Jn 2:3\u201311", t: "He that saith he abideth in Him, ought himself also to walk, even as He walked." }, g: { r: "Lk 2:36\u201340", t: "Anna the prophetess spoke of Him to all that looked for the redemption of Israel." } },
  "Friday in Christmastide": { e: { r: "1 Jn 2:12\u201317", t: "Love not the world, nor the things which are in the world. The world passeth away, but he that doth the will of God abideth for ever." }, g: { r: "Mt 2:13\u201318", t: "An angel of the Lord appeared to Joseph: Arise, take the Child and His Mother, and fly into Egypt." } },
  "Saturday in Christmastide": { e: { r: "1 Jn 2:18\u201321", t: "You have the unction from the Holy One, and know all things." }, g: { r: "Mt 2:19\u201323", t: "Joseph rising up took the Child and His Mother, and came into the land of Israel." } },
};

// ═══════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════════

function TopBar({ title, onBack, showBack, rightAction }) {
  return (
    <>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 20px 12px", background: T.warmWhite,
        borderBottom: "1px solid rgba(212,168,67,0.2)", flexShrink: 0,
      }}>
        {showBack ? (
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: fz(24), color: T.navyText, padding: 0, lineHeight: 1, width: 28 }}>←</button>
        ) : <div style={{ width: 28 }} />}
        <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(14), fontWeight: 600, color: T.navyText, letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "center", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
        {rightAction || <div style={{ width: 28 }} />}
      </div>
      <div style={{ height: 2, flexShrink: 0, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)`, opacity: 0.4 }} />
    </>
  );
}

function BottomNav({ active, onTab }) {
  const tabs = [
    { id: "seek", icon: "✝", label: "Seek" },
    { id: "today", icon: "📅", label: "Today" },
    { id: "pray", icon: "🙏", label: "Pray" },
    { id: "tradition", icon: "🏛", label: "Doctors" },
  ];
  return (
    <div style={{
      display: "flex", justifyContent: "space-around",
      padding: "8px 0 14px", background: T.warmWhite,
      borderTop: `1px solid ${T.cardBorder}`, flexShrink: 0,
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onTab(t.id)} style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          background: "none", border: "none", cursor: "pointer", padding: "4px 14px",
        }}>
          <span style={{ fontSize: fz(18), opacity: active === t.id ? 1 : 0.45 }}>{t.icon}</span>
          <span style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 600, letterSpacing: "0.04em", color: active === t.id ? T.crimson : T.inkLight }}>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

function SaintQuote({ name, quote, source, borderColor, isExact }) {
  return (
    <div style={{ borderLeft: `3px solid ${borderColor || T.gold}`, paddingLeft: 16 }}>
      <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(11), fontWeight: 700, color: T.gold, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>{name}</div>
      {quote && quote.trim() && <div style={{ fontFamily: "EB Garamond, serif", fontSize: fz(16), fontStyle: "italic", color: T.inkDark, lineHeight: 1.6 }}>{isExact ? `\u201C${quote}\u201D` : quote}</div>}
      {source && <div style={{ fontFamily: "EB Garamond, serif", fontSize: fz(13), color: T.inkLight, marginTop: 3 }}>{source}</div>}
    </div>
  );
}

function Card({ children, style: s }) {
  return <div style={{ background: T.warmWhite, borderRadius: 12, border: `1px solid ${T.cardBorder}`, padding: "16px 18px", ...s }}>{children}</div>;
}

function CardTitle({ children, color }) {
  return <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(12), fontWeight: 700, color: color || T.navyText, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>{children}</div>;
}

function CrimsonBtn({ children, onClick, style: s }) {
  return <button onClick={onClick} style={{ display: "block", width: "100%", padding: "14px 0", fontFamily: "Cinzel, serif", fontSize: fz(13), fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: T.warmWhite, background: `linear-gradient(135deg, ${T.crimson}, ${T.crimsonLight})`, border: "none", borderRadius: 10, cursor: "pointer", boxShadow: `0 3px 12px ${T.shadowCrimson}`, ...s }}>{children}</button>;
}

function NavyBtn({ children, onClick, style: s }) {
  return <button onClick={onClick} style={{ display: "block", width: "100%", padding: "14px 0", fontFamily: "Cinzel, serif", fontSize: fz(13), fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: T.warmWhite, background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`, border: "none", borderRadius: 10, cursor: "pointer", boxShadow: `0 3px 12px ${T.shadowNavy}`, ...s }}>{children}</button>;
}

function GhostBtn({ children, onClick }) {
  return <button onClick={onClick} style={{ display: "block", width: "100%", padding: "13px 0", fontFamily: "Cinzel, serif", fontSize: fz(13), fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: T.navyText, background: T.warmWhite, border: `1px solid rgba(26,39,68,0.15)`, borderRadius: 10, cursor: "pointer" }}>{children}</button>;
}

// ═══════════════════════════════════════════════════════════════════
// SAINT OF THE DAY
// ═══════════════════════════════════════════════════════════════════
const SAINTS_BY_DATE = {
  "1-1": { n: "Solemnity of Mary, Mother of God", bio: "The Church begins each year honoring the Blessed Virgin under her greatest title. The Council of Ephesus (431) proclaimed Mary Theotokos — God-bearer — defending the unity of Christ's divine and human natures.", icon: "👑" },
  "1-2": { n: "Sts. Basil the Great & Gregory Nazianzen", bio: "Two Cappadocian Fathers and Doctors of the Church who defended Trinitarian orthodoxy against Arianism. Basil organized monastic life in the East; Gregory's theological orations earned him the title 'The Theologian.'", icon: "📜" },
  "1-4": { n: "St. Elizabeth Ann Seton", bio: "First native-born American saint. A convert from Episcopalianism, she founded the Sisters of Charity and established the first Catholic school system in the United States.", icon: "🏫" },
  "1-5": { n: "St. John Neumann", bio: "Bohemian-born Bishop of Philadelphia, first male American saint. Built over 80 churches and nearly 100 schools, establishing the first diocesan Catholic school system.", icon: "⛪" },
  "1-13": { n: "St. Hilary of Poitiers", bio: "The 'Athanasius of the West,' exiled for opposing Arianism. His theological writings on the Trinity laid groundwork for Western Trinitarian doctrine. Doctor of the Church.", icon: "🛡" },
  "1-17": { n: "St. Anthony of Egypt", bio: "Father of monasticism. At 20 he sold everything and withdrew to the desert, where he battled demons and attracted followers. His example inspired the entire monastic movement.", icon: "🏜" },
  "1-21": { n: "St. Agnes", bio: "Roman virgin martyr, killed at age 12 or 13 during the persecution of Diocletian. Her courage made her one of the most celebrated saints of antiquity. Patron of girls and purity.", icon: "🐑" },
  "1-24": { n: "St. Francis de Sales", bio: "Bishop of Geneva and Doctor of the Church. His Introduction to the Devout Life revolutionized spirituality by teaching that holiness is for everyone, not just monks and nuns.", icon: "💜" },
  "1-25": { n: "Conversion of St. Paul", bio: "Saul of Tarsus, zealous persecutor of Christians, was struck down on the road to Damascus by a blinding light. 'Saul, Saul, why do you persecute Me?' He became the Apostle to the Gentiles.", icon: "⚡" },
  "1-28": { n: "St. Thomas Aquinas", bio: "The Angelic Doctor, greatest theologian of the Catholic Church. His Summa Theologiae synthesized faith and reason into a masterwork that remains the foundation of Catholic moral and dogmatic theology.", icon: "🏛" },
  "1-31": { n: "St. John Bosco", bio: "Patron of youth. Founded the Salesians to educate poor and abandoned boys in Turin. His 'preventive system' of education — based on reason, religion, and loving-kindness — transformed countless lives.", icon: "👦" },
  "2-1": { n: "St. Brigid of Kildare", bio: "One of Ireland's three patron saints. Founded a double monastery at Kildare that became a center of learning and art. Her generosity was legendary — she once gave away her father's sword to a leper.", icon: "🇮🇪" },
  "2-2": { n: "Purification of the B.V.M.", bio: "Candlemas: forty days after Christmas, Mary presented Jesus in the Temple. Simeon recognized the Christ child and prophesied: 'A sword shall pierce thy own soul also.'", icon: "🕯" },
  "2-3": { n: "St. Blaise", bio: "Bishop and martyr. According to tradition, he miraculously saved a boy choking on a fishbone. His intercession is invoked for throat ailments; the blessing of throats is given on his feast.", icon: "✋" },
  "2-5": { n: "St. Agatha", bio: "Sicilian virgin martyr under the Decian persecution. Her courage under torture made her one of the most venerated early saints. Patron of breast cancer patients and against fire.", icon: "🔥" },
  "2-6": { n: "St. Paul Miki & Companions", bio: "Twenty-six Catholics — Jesuits, Franciscans, and laypeople — crucified at Nagasaki in 1597. From his cross, Paul Miki preached his final sermon, forgiving his executioners.", icon: "🇯🇵" },
  "2-8": { n: "St. Jerome Emiliani", bio: "Venetian soldier who, after imprisonment, devoted his life to orphans and the abandoned. Founded the Somaschi Fathers. Patron of orphans and abandoned children.", icon: "🏠" },
  "2-10": { n: "St. Scholastica", bio: "Twin sister of St. Benedict and foundress of women's Benedictine monasticism. When Benedict tried to leave after their last visit, her prayers brought a storm that kept him — she died three days later.", icon: "🕊" },
  "2-11": { n: "Our Lady of Lourdes", bio: "In 1858, the Blessed Virgin appeared eighteen times to Bernadette Soubirous in a grotto at Lourdes, France, identifying herself as 'the Immaculate Conception.' The spring has been a site of miraculous healings.", icon: "💧" },
  "2-14": { n: "Sts. Cyril & Methodius", bio: "Brothers from Thessalonica, apostles to the Slavs. They created the Glagolitic alphabet to translate Scripture and liturgy into Slavonic, laying the foundation for Slavic Christianity and culture.", icon: "📖" },
  "2-22": { n: "Chair of St. Peter", bio: "This feast celebrates Peter's authority as head of the Church, given by Christ: 'Thou art Peter, and upon this rock I will build My Church.' The ancient wooden chair symbolizes papal teaching authority.", icon: "🪑" },
  "2-23": { n: "St. Polycarp of Smyrna", bio: "Disciple of St. John the Apostle and Bishop of Smyrna. Martyred at 86, he told the proconsul: 'Eighty-six years I have served Him, and He has done me no wrong. How can I blaspheme my King who saved me?'", icon: "🔥" },
  "2-24": { n: "St. Matthias", bio: "Chosen by lot to replace Judas as the twelfth apostle. He had followed Christ from His baptism through the Ascension. Tradition holds he preached in Judea and Ethiopia before being martyred.", icon: "🎲" },
  "3-4": { n: "St. Casimir", bio: "Prince of Poland who chose a life of prayer, penance, and charity over royal ambition. Died at 25 of tuberculosis. His devotion to the Blessed Virgin was expressed in his favorite hymn, Omni die dic Mariae.", icon: "👑" },
  "3-7": { n: "Sts. Perpetua & Felicity", bio: "A young noblewoman and her slave, martyred together at Carthage in 203. Perpetua's prison diary — one of the earliest Christian autobiographies — records her visions and her fearless faith.", icon: "⚔" },
  "3-8": { n: "St. John of God", bio: "Portuguese soldier turned bookseller who, after a conversion experience, devoted himself to the sick and homeless. Founded the Brothers Hospitallers. Patron of hospitals and the sick.", icon: "🏥" },
  "3-9": { n: "St. Frances of Rome", bio: "Married at 13, she fulfilled her duties as wife and mother while living an interior life of extraordinary mysticism. Founded the Oblates of Tor de' Specchi. Patron of automobile drivers.", icon: "🚗" },
  "3-17": { n: "St. Patrick", bio: "Apostle of Ireland. Kidnapped from Britain at 16 and enslaved for six years. After escaping, he returned as a missionary bishop and converted the island. His Confessio reveals deep humility.", icon: "☘" },
  "3-19": { n: "St. Joseph", bio: "Spouse of the Blessed Virgin Mary and foster-father of Jesus. A just man who protected the Holy Family in silence and faithfulness. Patron of the universal Church, workers, and a happy death.", icon: "🪻" },
  "3-25": { n: "The Annunciation", bio: "The angel Gabriel announced to Mary that she would conceive the Son of God. Her 'Fiat' — 'Be it done unto me according to thy word' — is the moment of the Incarnation, when God became man.", icon: "🕊" },
  "4-2": { n: "St. Francis of Paola", bio: "Calabrian hermit and founder of the Minim Friars, the strictest of all mendicant orders. His life of extreme penance and miraculous deeds drew the attention of kings. Patron of seafarers.", icon: "⛵" },
  "4-4": { n: "St. Isidore of Seville", bio: "Last of the Latin Fathers and a Doctor of the Church. His Etymologies was the first encyclopedia, preserving classical learning for the medieval world. Patron of the internet.", icon: "💻" },
  "4-5": { n: "St. Vincent Ferrer", bio: "Dominican friar and one of the greatest preachers in Church history. Traveled across Europe converting thousands through his preaching and miracles.", icon: "🔔" },
  "4-7": { n: "St. John Baptist de la Salle", bio: "French priest who revolutionized education. Founded the Brothers of the Christian Schools and pioneered teaching in the vernacular and schools for the poor.", icon: "📚" },
  "4-11": { n: "St. Stanislaus", bio: "Bishop of Kraków, martyred by King Bolesław II for denouncing the king's tyranny. Patron of Poland and of moral order in public life.", icon: "🇵🇱" },
  "4-23": { n: "St. George", bio: "Roman soldier and martyr, one of the most venerated saints in both East and West. The legend of his slaying a dragon symbolizes the victory of faith over evil. Patron of England and soldiers.", icon: "🐉" },
  "4-25": { n: "St. Mark the Evangelist", bio: "Author of the second Gospel, companion of Peter and Paul. His Gospel is the shortest and most vivid, likely preserving Peter's eyewitness preaching. Patron of Venice.", icon: "🦁" },
  "4-28": { n: "St. Louis de Montfort", bio: "French priest whose True Devotion to the Blessed Virgin Mary is one of the most influential Marian works ever written. His total consecration spirituality was adopted by St. John Paul II.", icon: "📿" },
  "4-29": { n: "St. Catherine of Siena", bio: "Dominican tertiary, mystic, and Doctor of the Church. She persuaded Pope Gregory XI to return from Avignon to Rome. Her Dialogue is a masterpiece of mystical theology.", icon: "🔥" },
  "4-30": { n: "St. Pius V", bio: "Dominican pope who implemented the reforms of the Council of Trent, codified the Roman Missal and Breviary, and organized the Christian fleet that won the Battle of Lepanto.", icon: "⚓" },
  "5-1": { n: "St. Joseph the Worker", bio: "Established by Pius XII in 1955, this feast honors the dignity of human labor through the example of Joseph, who worked as a carpenter to support the Holy Family.", icon: "🔨" },
  "5-2": { n: "St. Athanasius", bio: "Bishop of Alexandria, exiled five times for defending the divinity of Christ against Arianism. 'Athanasius contra mundum' — Athanasius against the world. Doctor of the Church.", icon: "🛡" },
  "5-3": { n: "Sts. Philip & James, Apostles", bio: "Philip brought Nathanael to Jesus; at the Last Supper he asked 'Lord, show us the Father.' James 'the Less' led the Church in Jerusalem and wrote the epistle bearing his name.", icon: "✝" },
  "5-13": { n: "Our Lady of Fatima", bio: "In 1917, the Blessed Virgin appeared six times to three shepherd children in Fatima, Portugal, calling for prayer, penance, and devotion to her Immaculate Heart.", icon: "☀" },
  "5-14": { n: "St. Matthias", bio: "Chosen by lot to replace Judas as the twelfth apostle. He had followed Christ from His baptism through the Ascension. Tradition holds he preached in Judea and was martyred.", icon: "🎲" },
  "5-15": { n: "St. Isidore the Farmer", bio: "Spanish laborer of Madrid whose piety was so deep that, according to legend, angels plowed his fields while he prayed. Patron of farmers and laborers.", icon: "🌾" },
  "5-22": { n: "St. Rita of Cascia", bio: "Married against her will to a violent man, she endured 18 years of abuse before his conversion and murder. After her sons died, she entered an Augustinian convent. Patron of impossible causes.", icon: "🌹" },
  "5-25": { n: "St. Bede the Venerable", bio: "English Benedictine monk, historian, and Doctor of the Church. His Ecclesiastical History of the English People is the primary source for early English history.", icon: "📜" },
  "5-26": { n: "St. Philip Neri", bio: "The 'Apostle of Rome' and founder of the Oratory. His joyful, humorous personality and gift for spiritual direction transformed Renaissance Rome.", icon: "😄" },
  "5-30": { n: "St. Joan of Arc", bio: "French peasant girl who, guided by heavenly voices, led the French army to victory at Orléans at age 17. Captured, tried for heresy, and burned at the stake at 19. Later rehabilitated and canonized.", icon: "⚔" },
  "6-1": { n: "St. Justin Martyr", bio: "Philosopher who converted after studying Christianity. His First and Second Apologies are the earliest systematic defenses of the faith. Martyred in Rome c. 165.", icon: "📜" },
  "6-3": { n: "St. Charles Lwanga & Companions", bio: "Twenty-two Ugandan martyrs, pages in the court of King Mwanga II, killed between 1885-1887 for refusing the king's advances and for their Catholic faith. The youngest was 13.", icon: "🇺🇬" },
  "6-5": { n: "St. Boniface", bio: "English Benedictine who became the Apostle of Germany. He felled the sacred oak of Thor at Geismar, organized the German church, and was martyred at 80.", icon: "🌳" },
  "6-11": { n: "St. Barnabas", bio: "Apostle and companion of Paul on his first missionary journey. A Levite from Cyprus, he sold his property and gave the proceeds to the apostles. His name means 'son of encouragement.'", icon: "🤝" },
  "6-13": { n: "St. Anthony of Padua", bio: "Portuguese Franciscan, Doctor of the Church, and the greatest preacher of his age. His sermons drew tens of thousands. Patron of lost things — invoked more than almost any other saint.", icon: "🔍" },
  "6-21": { n: "St. Aloysius Gonzaga", bio: "Italian Jesuit who renounced his family's marquisate to enter religious life. Died at 23 nursing plague victims in Rome. Patron of youth and students.", icon: "🎓" },
  "6-22": { n: "St. Thomas More", bio: "Lord Chancellor of England, beheaded for refusing to acknowledge Henry VIII as head of the Church. On the scaffold: 'I die the King's good servant, but God's first.' Patron of lawyers.", icon: "⚖" },
  "6-24": { n: "Nativity of St. John the Baptist", bio: "The only saint besides the Blessed Virgin whose birth is celebrated liturgically. The last prophet, he prepared the way for Christ: 'He must increase, but I must decrease.'", icon: "🏜" },
  "6-29": { n: "Sts. Peter & Paul", bio: "The two pillars of the Church. Peter, the fisherman chosen as the Rock; Paul, the persecutor transformed into the Apostle to the Gentiles. Both martyred in Rome under Nero.", icon: "🗝" },
  "7-3": { n: "St. Thomas the Apostle", bio: "Called 'Doubting Thomas,' his honest questioning led to one of Scripture's greatest professions of faith: 'My Lord and my God!' Tradition holds he evangelized India.", icon: "🇮🇳" },
  "7-4": { n: "St. Elizabeth of Portugal", bio: "Queen of Portugal, renowned for her charity and peacemaking between warring Christian kings. After her husband's death she became a Franciscan tertiary and served the poor.", icon: "👑" },
  "7-11": { n: "St. Benedict of Nursia", bio: "Father of Western monasticism. His Rule — 'Ora et Labora' — balanced prayer, work, and community life, shaping Western civilization. His monks preserved learning through the Dark Ages.", icon: "📕" },
  "7-14": { n: "St. Kateri Tekakwitha", bio: "First Native American saint. An Algonquin-Mohawk convert who endured persecution from her tribe for her faith. Called the 'Lily of the Mohawks' for her purity and devotion.", icon: "🌸" },
  "7-15": { n: "St. Bonaventure", bio: "Franciscan Doctor of the Church, called the 'Seraphic Doctor.' His mystical theology, especially The Journey of the Mind to God, complements Aquinas's rationalism with the way of love.", icon: "🔥" },
  "7-22": { n: "St. Mary Magdalene", bio: "First witness of the Resurrection. Jesus appeared to her at the tomb and sent her to tell the apostles — making her the 'Apostle to the Apostles.' Patron of penitents.", icon: "🏺" },
  "7-25": { n: "St. James the Greater", bio: "Son of Zebedee, brother of John, first apostle to be martyred. Tradition holds his relics rest at Santiago de Compostela, one of Christianity's greatest pilgrimage sites.", icon: "🐚" },
  "7-26": { n: "Sts. Joachim & Anne", bio: "Parents of the Blessed Virgin Mary, grandparents of Jesus. Though not mentioned in Scripture, ancient tradition honors their faithful marriage and the gift of their daughter to the world.", icon: "👴" },
  "7-29": { n: "St. Martha", bio: "Sister of Mary and Lazarus, who welcomed Jesus into her home at Bethany. When she complained that Mary wasn't helping, Jesus gently taught her about the 'better part.' Patron of cooks.", icon: "🏠" },
  "7-31": { n: "St. Ignatius of Loyola", bio: "Basque soldier whose conversion during convalescence led him to found the Society of Jesus. His Spiritual Exercises remain one of the most powerful tools for discernment in the Church.", icon: "⚔" },
  "8-1": { n: "St. Alphonsus Liguori", bio: "Founder of the Redemptorists and Doctor of the Church. His moral theology balanced rigorism and laxism, becoming the standard for confessors. Patron of moral theologians.", icon: "✝" },
  "8-4": { n: "St. John Vianney", bio: "The Curé of Ars, patron of parish priests. Barely passing seminary, he transformed his parish through holiness and spent 16 hours daily hearing confessions.", icon: "⛪" },
  "8-8": { n: "St. Dominic", bio: "Founder of the Order of Preachers (Dominicans). Combated the Albigensian heresy through preaching and learning rather than force. Tradition credits him with receiving the Rosary from Our Lady.", icon: "📿" },
  "8-10": { n: "St. Lawrence", bio: "Roman deacon martyred under Valerian in 258. When ordered to produce the Church's treasures, he gathered the poor: 'These are the treasures of the Church.' Roasted on a gridiron.", icon: "🔥" },
  "8-11": { n: "St. Clare of Assisi", bio: "Founder of the Poor Clares, inspired by St. Francis to embrace radical poverty. When Saracens besieged her convent, she held up the Blessed Sacrament and they fled.", icon: "☀" },
  "8-14": { n: "St. Maximilian Kolbe", bio: "Polish Franciscan who volunteered to die in place of a stranger at Auschwitz. After two weeks in a starvation bunker, he was killed by lethal injection. The Martyr of Charity.", icon: "🇵🇱" },
  "8-15": { n: "The Assumption of the B.V.M.", bio: "Dogma proclaimed by Pius XII in 1950: at the end of her earthly life, Mary was assumed body and soul into heavenly glory. The greatest of all Marian feasts.", icon: "👑" },
  "8-20": { n: "St. Bernard of Clairvaux", bio: "Cistercian abbot, Doctor of the Church, and the most influential churchman of the 12th century. His mystical writings on the Song of Songs shaped Western spirituality.", icon: "🏔" },
  "8-23": { n: "St. Rose of Lima", bio: "First saint of the Americas. A Dominican tertiary in Lima, Peru, she lived a life of extreme penance and mystical prayer while caring for the poor. Patron of Latin America.", icon: "🌹" },
  "8-27": { n: "St. Monica", bio: "Mother of St. Augustine. For 17 years she wept and prayed for her brilliant, wayward son. Her perseverance was rewarded when Augustine converted and became one of the Church's greatest Doctors.", icon: "💧" },
  "8-28": { n: "St. Augustine of Hippo", bio: "The Doctor of Grace. His restless search through Manichaeism and philosophy ended at the baptismal font. His Confessions and City of God shaped Western thought for 1,600 years.", icon: "🔥" },
  "8-29": { n: "Beheading of St. John the Baptist", bio: "Herod Antipas imprisoned John for condemning his adulterous marriage. At a banquet, Salome's dance pleased Herod, and Herodias demanded John's head on a platter.", icon: "⚔" },
  "9-3": { n: "St. Gregory the Great", bio: "Pope and Doctor of the Church who sent Augustine to evangelize England, reformed the liturgy, and wrote the Pastoral Rule, a handbook for bishops still used today.", icon: "🎵" },
  "9-8": { n: "Nativity of the B.V.M.", bio: "The Church celebrates Mary's birth as the dawn before the Sun of Justice. Through her, God prepared a worthy dwelling for His Son. One of the oldest Marian feasts.", icon: "⭐" },
  "9-13": { n: "St. John Chrysostom", bio: "Archbishop of Constantinople, Doctor of the Church, the greatest preacher in Eastern Christianity. 'Chrysostom' means 'Golden Mouth.' Exiled twice for denouncing imperial corruption.", icon: "🗣" },
  "9-14": { n: "Exaltation of the Holy Cross", bio: "Celebrates the finding of the True Cross by St. Helena in Jerusalem (c. 326) and its recovery from the Persians by Emperor Heraclius in 628.", icon: "✝" },
  "9-15": { n: "Our Lady of Sorrows", bio: "The Church meditates on the seven sorrows of Mary: from Simeon's prophecy to the burial of Christ. A sword pierced her Immaculate Heart at each station of her Son's Passion.", icon: "🗡" },
  "9-16": { n: "Sts. Cornelius & Cyprian", bio: "Pope Cornelius and Bishop Cyprian of Carthage, united in defending the Church's authority to forgive sins of apostasy. Both martyred — companions in death as in ministry.", icon: "🤝" },
  "9-21": { n: "St. Matthew", bio: "Tax collector called by Jesus with two words: 'Follow Me.' He left everything and followed. His Gospel presents Jesus as the fulfillment of Old Testament prophecy.", icon: "📖" },
  "9-23": { n: "St. Padre Pio", bio: "Capuchin friar who bore the stigmata for 50 years. He could read souls in confession, bilocate, and heal the sick. Founded a major hospital in southern Italy.", icon: "🩸" },
  "9-27": { n: "St. Vincent de Paul", bio: "Patron of all charitable works. Once enslaved in North Africa, he devoted his life to the poor, founding the Congregation of the Mission and co-founding the Daughters of Charity.", icon: "🤲" },
  "9-29": { n: "Sts. Michael, Gabriel & Raphael", bio: "The three archangels: Michael the warrior against Satan, Gabriel the messenger of the Annunciation, Raphael the healer and guide of Tobias. 'Who is like God?' is Michael's battle cry.", icon: "⚔" },
  "9-30": { n: "St. Jerome", bio: "Greatest Scripture scholar of the early Church. His Latin Vulgate translation shaped Christianity for a millennium. Fiery and brilliant: 'Ignorance of Scripture is ignorance of Christ.'", icon: "📜" },
  "10-1": { n: "St. Thérèse of Lisieux", bio: "The Little Flower, Doctor of the Church. Her 'Little Way' of spiritual childhood — trust and small acts of love — has guided millions. She died at 24 promising to do good on earth from heaven.", icon: "🌹" },
  "10-2": { n: "Holy Guardian Angels", bio: "The Church teaches each person has a guardian angel from birth. 'See that you do not despise one of these little ones; for their angels in heaven always see the face of My Father.' (Mt 18:10)", icon: "👼" },
  "10-4": { n: "St. Francis of Assisi", bio: "The Poor Man of Assisi who rebuilt the Church by embracing radical poverty and joy. He received the stigmata, preached to the birds, and composed the Canticle of the Sun.", icon: "🐦" },
  "10-7": { n: "Our Lady of the Rosary", bio: "Commemorates the Christian victory at Lepanto (1571), attributed to the Rosary. Pope St. Pius V asked all Christendom to pray the Rosary, and the Ottoman fleet was defeated.", icon: "📿" },
  "10-15": { n: "St. Teresa of Ávila", bio: "Carmelite reformer, mystic, and Doctor of the Church. Her Interior Castle maps the soul's journey to God in seven mansions. 'Let nothing disturb you; God alone suffices.'", icon: "🏰" },
  "10-18": { n: "St. Luke the Evangelist", bio: "Physician, painter, and author of the third Gospel and Acts. His Gospel uniquely emphasizes mercy, women, the poor, and the joy of salvation. Patron of artists and physicians.", icon: "🎨" },
  "10-19": { n: "North American Martyrs", bio: "Eight Jesuit missionaries — including Sts. Jean de Brébeuf and Isaac Jogues — martyred in New France (1642-1649) while evangelizing the Huron and Iroquois peoples.", icon: "🇨🇦" },
  "10-22": { n: "St. John Paul II", bio: "Karol Wojtyła, Pope from 1978-2005. Helped bring down Communism, traveled to 129 countries, wrote 14 encyclicals, and canonized more saints than all his predecessors combined.", icon: "🇻🇦" },
  "10-28": { n: "Sts. Simon & Jude", bio: "Simon the Zealot and Jude Thaddaeus, apostles traditionally martyred together in Persia. Jude is patron of desperate and hopeless causes.", icon: "✝" },
  "11-1": { n: "All Saints", bio: "The Church rejoices in all the blessed in heaven — known and unknown, canonized and hidden. Their intercession surrounds us; their example encourages us. We are called to join their company.", icon: "✨" },
  "11-2": { n: "All Souls", bio: "The Church prays for all the faithful departed being purified in Purgatory. Our prayers, Masses, and sacrifices can hasten their entry into heaven. An act of charity reaching beyond death.", icon: "🕯" },
  "11-3": { n: "St. Martin de Porres", bio: "Dominican lay brother in Lima, the illegitimate son of a Spanish knight and a freed slave. His humility, charity, and miraculous gifts astonished all who knew him.", icon: "🐕" },
  "11-4": { n: "St. Charles Borromeo", bio: "Archbishop of Milan and leader of the Counter-Reformation. He implemented Trent's reforms, founded seminaries, and personally nursed plague victims. Model of episcopal duty.", icon: "⛪" },
  "11-11": { n: "St. Martin of Tours", bio: "Roman soldier who cut his cloak in half to share with a beggar — then saw Christ wearing it in a dream. Became Bishop of Tours. One of the first non-martyrs venerated as a saint.", icon: "🧥" },
  "11-13": { n: "St. Frances Xavier Cabrini", bio: "First American citizen canonized. Italian-born foundress of the Missionary Sisters of the Sacred Heart, she opened 67 institutions across the Americas. Patron of immigrants.", icon: "🗽" },
  "11-16": { n: "St. Margaret of Scotland", bio: "English-born Queen of Scotland whose reign brought civilization, education, and reform to the Scottish Church. Known for her personal holiness and devotion to justice.", icon: "🏴" },
  "11-17": { n: "St. Elizabeth of Hungary", bio: "Princess who married at 14 and was widowed at 20. She gave away her fortune to the poor, built hospitals, and joined the Third Order of St. Francis. Died at 24.", icon: "🍞" },
  "11-22": { n: "St. Cecilia", bio: "Roman virgin martyr, one of the most famous early saints. According to tradition, she sang to God in her heart during her wedding. Patron of musicians and church music.", icon: "🎵" },
  "11-24": { n: "St. Andrew Dung-Lac & Companions", bio: "117 Vietnamese martyrs killed between 1625 and 1886 — priests, catechists, and laypeople. Their witness built one of Asia's most vibrant Catholic communities.", icon: "🇻🇳" },
  "11-30": { n: "St. Andrew the Apostle", bio: "Brother of Peter, first called by Jesus. He brought his brother to Christ: 'We have found the Messiah.' Tradition holds he was crucified on an X-shaped cross in Greece.", icon: "🏴" },
  "12-3": { n: "St. Francis Xavier", bio: "Jesuit co-founder and the greatest missionary since St. Paul. He baptized tens of thousands across India, Southeast Asia, and Japan. Died within sight of China, his ultimate goal.", icon: "🌏" },
  "12-4": { n: "St. John Damascene", bio: "Last of the Greek Fathers and Doctor of the Church. His Fount of Knowledge systematized Eastern theology. He defended the veneration of icons against the iconoclasts.", icon: "🖼" },
  "12-6": { n: "St. Nicholas", bio: "Bishop of Myra in the 4th century, famous for his generosity. He secretly provided dowries for three impoverished sisters and was renowned for miraculous deeds. The original Santa Claus.", icon: "🎅" },
  "12-7": { n: "St. Ambrose", bio: "Governor of Milan elected bishop by popular acclaim before he was even baptized. Doctor of the Church, he mentored St. Augustine, composed hymns, and fearlessly rebuked Emperor Theodosius.", icon: "🐝" },
  "12-8": { n: "Immaculate Conception", bio: "Dogma defined by Pius IX in 1854: Mary was preserved from all stain of original sin from the first moment of her conception, by the singular grace of God, in view of the merits of Christ.", icon: "💙" },
  "12-12": { n: "Our Lady of Guadalupe", bio: "In 1531, the Blessed Virgin appeared to Juan Diego on Tepeyac Hill near Mexico City. Her miraculous image on his tilma converted millions of indigenous people. Patroness of the Americas.", icon: "🇲🇽" },
  "12-13": { n: "St. Lucy", bio: "Sicilian virgin martyr whose name means 'light.' She is invoked for eye problems and her feast near the winter solstice symbolizes Christ, the Light of the World, coming into darkness.", icon: "👁" },
  "12-14": { n: "St. John of the Cross", bio: "Carmelite mystic, poet, and Doctor of the Church. His Dark Night of the Soul charts the soul's purification on its way to divine union. Co-reformer with St. Teresa of Ávila.", icon: "🌙" },
  "12-25": { n: "The Nativity of Our Lord", bio: "Christmas: 'And the Word was made flesh and dwelt among us.' The eternal Son of God, through whom all things were made, is born of the Virgin Mary in a stable at Bethlehem.", icon: "⭐" },
  "12-26": { n: "St. Stephen", bio: "The first Christian martyr, one of the seven deacons. Filled with the Holy Spirit, he saw heaven opened as he was stoned to death, praying: 'Lord, do not hold this sin against them.'", icon: "🪨" },
  "12-27": { n: "St. John the Evangelist", bio: "The beloved disciple who leaned on Jesus' breast at the Last Supper and stood at the foot of the Cross. Author of the fourth Gospel, three epistles, and the Apocalypse.", icon: "🦅" },
  "12-28": { n: "Holy Innocents", bio: "The infant boys of Bethlehem slaughtered by Herod in his attempt to kill the newborn King. The Church honors them as the first martyrs for Christ — dying not by choice but by grace.", icon: "👶" },
  "12-29": { n: "St. Thomas Becket", bio: "Archbishop of Canterbury, murdered in his cathedral by knights of Henry II for defending the Church's rights against royal encroachment. Patron of the secular clergy.", icon: "⛪" },
};

const SAINT_POOL = [
  { n: "St. Maximilian Kolbe", bio: "Polish Franciscan who volunteered to die in place of a stranger at Auschwitz. After two weeks in a starvation bunker, he was killed by lethal injection. The Martyr of Charity.", icon: "🇵🇱" },
  { n: "St. Padre Pio", bio: "Capuchin friar who bore the stigmata for 50 years. He could read souls in confession, bilocate, and heal the sick. Founded the Casa Sollievo della Sofferenza hospital.", icon: "🩸" },
  { n: "St. Josemaría Escrivá", bio: "Spanish priest who founded Opus Dei in 1928, teaching that ordinary work and daily life are paths to holiness. His book The Way has sold millions of copies worldwide.", icon: "💼" },
  { n: "St. Faustina Kowalska", bio: "Polish nun to whom Jesus revealed the Divine Mercy devotion. Her Diary records extraordinary mystical experiences and Christ's message: 'Jesus, I trust in You.'", icon: "🤍" },
  { n: "St. Damien of Molokai", bio: "Belgian priest who volunteered to serve the leper colony on Molokai, Hawaii. He built houses, churches, and coffins for 16 years until he himself contracted leprosy and died among his people.", icon: "🏝" },
  { n: "St. Gianna Beretta Molla", bio: "Italian physician and mother who refused an abortion that would have saved her life during a difficult pregnancy. She died a week after delivering her daughter in 1962.", icon: "👩‍⚕" },
  { n: "St. Edith Stein", bio: "Jewish philosopher who converted to Catholicism, became a Carmelite nun (Sr. Teresa Benedicta of the Cross), and was murdered at Auschwitz. Co-patroness of Europe.", icon: "✡" },
  { n: "Bl. Pier Giorgio Frassati", bio: "Italian university student known for his joyful piety and secret charity to the poor. He died of polio at 24. At his funeral, the poor of Turin lined the streets — his family had no idea.", icon: "⛰" },
  { n: "St. Josephine Bakhita", bio: "Sudanese woman kidnapped into slavery as a child, converted in Italy, and became a Canossian sister. Her gentle witness and forgiveness of her captors inspired all who met her.", icon: "🇸🇩" },
  { n: "St. Oscar Romero", bio: "Archbishop of San Salvador, assassinated while celebrating Mass in 1980 for defending the poor against government violence. A martyr for justice and the Gospel.", icon: "🇸🇻" },
  { n: "St. John Henry Newman", bio: "English convert from Anglicanism whose theological brilliance shaped the understanding of doctrinal development. Cardinal, poet, and gentleman. 'Heart speaks unto heart.'", icon: "🎓" },
  { n: "St. Hildegard of Bingen", bio: "Benedictine abbess, visionary, composer, and polymath. Her visions, music, and writings on theology, medicine, and nature make her one of the most creative minds of the medieval Church.", icon: "🎶" },
  { n: "St. André Bessette", bio: "Canadian Holy Cross Brother, a humble doorkeeper who devoted his life to St. Joseph. His prayers healed thousands; he built St. Joseph's Oratory in Montreal.", icon: "🇨🇦" },
  { n: "St. Charbel Makhlouf", bio: "Lebanese Maronite monk and hermit whose body remained incorrupt after death, exuding a mysterious liquid. His intercession is credited with countless healings across faiths.", icon: "🇱🇧" },
  { n: "St. Juan Diego", bio: "Aztec convert to whom Our Lady of Guadalupe appeared in 1531. His tilma bearing her miraculous image hangs in the Basilica of Guadalupe, visited by millions each year.", icon: "🇲🇽" },
];

function getSaintOfDay(date) {
  const key = (date.getMonth() + 1) + "-" + date.getDate();
  if (SAINTS_BY_DATE[key]) return SAINTS_BY_DATE[key];
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date - start) / 86400000);
  return SAINT_POOL[dayOfYear % SAINT_POOL.length];
}


// ═══════════════════════════════════════════════════════════════════
// SEEK GUIDANCE
// ═══════════════════════════════════════════════════════════════════

// Source URL resolver — maps citations to online texts
function resolveSourceUrl(citation) {
  if (!citation) return null;
  const c = citation.trim();

  // Catechism of the Catholic Church: CCC §1234 or CCC 1234
  const ccc = c.match(/CCC\s*§?\s*(\d+)/i);
  if (ccc) return `https://www.vatican.va/archive/ENG0015/__P${Math.floor(parseInt(ccc[1]) / 100).toString(16).toUpperCase()}.HTM`;

  // Baltimore Catechism
  if (/baltimore\s*catechism|^BC\s*§/i.test(c)) return "https://www.gutenberg.org/ebooks/14554";

  // Catechism of Pope St. Pius X
  if (/pius\s*x\s*catechism|catechism.*pius/i.test(c)) return "https://www.ewtn.com/catholicism/library/catechism-of-st-pius-x-1286";

  // Roman Catechism / Catechism of Trent
  if (/roman\s*catechism|catechism\s*of\s*trent|council\s*of\s*trent/i.test(c)) return "https://www.catholicculture.org/culture/library/catechism/";

  // Summa Theologiae: ST I-II Q.18 A.3 or Summa I, Q.37 etc.
  const summa = c.match(/(?:summa|ST)\s*(I+(?:-I+)?)\s*,?\s*(?:Q\.?\s*)?(\d+)/i);
  if (summa) {
    const parts = { "I": "FP", "I-II": "FS", "II-II": "SS", "III": "TP" };
    const part = parts[summa[1].toUpperCase()] || "FP";
    return `https://www.newadvent.org/summa/${part.toLowerCase()}${summa[2].padStart(3, "0")}.htm`;
  }
  if (/summa\s*theologiae|summa\s*theologica/i.test(c)) return "https://www.newadvent.org/summa/";

  // Papal encyclicals and Vatican documents
  if (/humanae\s*vitae/i.test(c)) return "https://www.vatican.va/content/paul-vi/en/encyclicals/documents/hf_p-vi_enc_25071968_humanae-vitae.html";
  if (/evangelium\s*vitae/i.test(c)) return "https://www.vatican.va/content/john-paul-ii/en/encyclicals/documents/hf_jp-ii_enc_25031995_evangelium-vitae.html";
  if (/veritatis\s*splendor/i.test(c)) return "https://www.vatican.va/content/john-paul-ii/en/encyclicals/documents/hf_jp-ii_enc_06081993_veritatis-splendor.html";
  if (/familiaris\s*consortio/i.test(c)) return "https://www.vatican.va/content/john-paul-ii/en/apost_exhortations/documents/hf_jp-ii_exh_19811122_familiaris-consortio.html";
  if (/deus\s*caritas/i.test(c)) return "https://www.vatican.va/content/benedict-xvi/en/encyclicals/documents/hf_ben-xvi_enc_20051225_deus-caritas-est.html";
  if (/casti\s*connubii/i.test(c)) return "https://www.vatican.va/content/pius-xi/en/encyclicals/documents/hf_p-xi_enc_19301231_casti-connubii.html";
  if (/rerum\s*novarum/i.test(c)) return "https://www.vatican.va/content/leo-xiii/en/encyclicals/documents/hf_l-xiii_enc_15051891_rerum-novarum.html";
  if (/quadragesimo\s*anno/i.test(c)) return "https://www.vatican.va/content/pius-xi/en/encyclicals/documents/hf_p-xi_enc_19310515_quadragesimo-anno.html";
  if (/pascendi/i.test(c)) return "https://www.vatican.va/content/pius-x/en/encyclicals/documents/hf_p-x_enc_19070908_pascendi-dominici-gregis.html";
  if (/aeterni\s*patris/i.test(c)) return "https://www.vatican.va/content/leo-xiii/en/encyclicals/documents/hf_l-xiii_enc_04081879_aeterni-patris.html";
  if (/mystici\s*corporis/i.test(c)) return "https://www.vatican.va/content/pius-xii/en/encyclicals/documents/hf_p-xii_enc_29061943_mystici-corporis-christi.html";
  if (/mediator\s*dei/i.test(c)) return "https://www.vatican.va/content/pius-xii/en/encyclicals/documents/hf_p-xii_enc_20111947_mediator-dei.html";
  if (/mirari\s*vos/i.test(c)) return "https://www.vatican.va/content/gregory-xvi/en/documents/encyclica-mirari-vos-15-augusto-1832.html";
  if (/quanta\s*cura/i.test(c)) return "https://www.vatican.va/content/pius-ix/en/documents/encyclica-quanta-cura-8-decembris-1864.html";
  if (/syllabus.*error/i.test(c)) return "https://www.vatican.va/content/pius-ix/en/documents/encyclica-quanta-cura-8-decembris-1864.html";
  if (/immortale\s*dei/i.test(c)) return "https://www.vatican.va/content/leo-xiii/en/encyclicals/documents/hf_l-xiii_enc_01111885_immortale-dei.html";
  if (/libertas/i.test(c) && !/introduction/i.test(c)) return "https://www.vatican.va/content/leo-xiii/en/encyclicals/documents/hf_l-xiii_enc_20061888_libertas.html";
  if (/mortalium\s*animos/i.test(c)) return "https://www.vatican.va/content/pius-xi/en/encyclicals/documents/hf_p-xi_enc_19280106_mortalium-animos.html";
  if (/divini\s*redemptoris/i.test(c)) return "https://www.vatican.va/content/pius-xi/en/encyclicals/documents/hf_p-xi_enc_19370319_divini-redemptoris.html";
  if (/mit\s*brennender/i.test(c)) return "https://www.vatican.va/content/pius-xi/en/encyclicals/documents/hf_p-xi_enc_14031937_mit-brennender-sorge.html";
  if (/humani\s*generis/i.test(c)) return "https://www.vatican.va/content/pius-xii/en/encyclicals/documents/hf_p-xii_enc_12081950_humani-generis.html";

  // Motu Proprio
  if (/ecclesia\s*dei/i.test(c)) return "https://www.vatican.va/content/john-paul-ii/en/motu_proprio/documents/hf_jp-ii_motu-proprio_02071988_ecclesia-dei.html";
  if (/ad\s*tuendam\s*fidem/i.test(c)) return "https://www.vatican.va/content/john-paul-ii/en/motu_proprio/documents/hf_jp-ii_motu-proprio_30061998_ad-tuendam-fidem.html";
  if (/summorum\s*pontificum/i.test(c)) return "https://www.vatican.va/content/benedict-xvi/en/motu_proprio/documents/hf_ben-xvi_motu-proprio_20070707_summorum-pontificum.html";
  if (/omnium\s*in\s*mentem/i.test(c)) return "https://www.vatican.va/content/benedict-xvi/en/apost_letters/documents/hf_ben-xvi_apl_20091026_codex-iuris-canonici.html";

  // Fides et Ratio
  if (/fides\s*et\s*ratio/i.test(c)) return "https://www.vatican.va/content/john-paul-ii/en/encyclicals/documents/hf_jp-ii_enc_14091998_fides-et-ratio.html";

  // Summa Contra Gentiles
  if (/contra\s*gentiles/i.test(c)) return "https://isidore.co/aquinas/ContraGentiles.htm";
  // CDF documents
  if (/persona\s*humana/i.test(c)) return "https://www.vatican.va/roman_curia/congregations/cfaith/documents/rc_con_cfaith_doc_19751229_persona-humana_en.html";
  if (/inter\s*insigniores/i.test(c)) return "https://www.vatican.va/roman_curia/congregations/cfaith/documents/rc_con_cfaith_doc_19761015_inter-insigniores_en.html";
  if (/dominus\s*iesus/i.test(c)) return "https://www.vatican.va/roman_curia/congregations/cfaith/documents/rc_con_cfaith_doc_20000806_dominus-iesus_en.html";
  if (/dignitas\s*personae/i.test(c)) return "https://www.vatican.va/roman_curia/congregations/cfaith/documents/rc_con_cfaith_doc_20081208_dignitas-personae_en.html";
  if (/donum\s*vitae/i.test(c)) return "https://www.vatican.va/roman_curia/congregations/cfaith/documents/rc_con_cfaith_doc_19870222_respect-for-human-life_en.html";

  // Canon Law
  // 1917 Code of Canon Law
  const canon1917 = c.match(/1917\s*Can\.?\s*(\d+)/i);
  if (canon1917) return `https://www.jgray.org/codes/1917cic.html`;
  // 1983 Code of Canon Law — Vatican's actual URL structure
  const canon = c.match(/(?<!1917\s*)Can\.?\s*(\d+)/i);
  if (canon) {
    const n = parseInt(canon[1]);
    // Vatican hosts the 1983 CIC by book; map canon number to book
    const book = n <= 203 ? "1" : n <= 746 ? "2" : n <= 1054 ? "3" : n <= 1252 ? "4" : n <= 1400 ? "5" : n <= 1752 ? "6" : "7";
    return `https://www.vatican.va/archive/cod-iuris-canonici/eng/documents/cic_lib${book}_en.html`;
  }

  // Scripture — Douay-Rheims Bible Online
  const book = c.match(/^((?:\d\s*)?[A-Z][a-z]+)\s*(\d+)/i);
  if (book) {
    const abbrevs = { "Gen": "gen", "Ex": "exo", "Lev": "lev", "Num": "num", "Deut": "deu", "Jos": "jos", "Judg": "jdg", "Ruth": "rut", "1 Sam": "sa1", "2 Sam": "sa2", "1 Kgs": "kg1", "2 Kgs": "kg2", "1 Chr": "ch1", "2 Chr": "ch2", "Ezra": "ezr", "Neh": "neh", "Tob": "tob", "Jdt": "jdt", "Est": "est", "Job": "job", "Ps": "psa", "Prov": "pro", "Eccles": "ecc", "Song": "sol", "Wis": "wis", "Sir": "sir", "Ecclus": "sir", "Is": "isa", "Jer": "jer", "Lam": "lam", "Bar": "bar", "Ez": "eze", "Dan": "dan", "Hos": "hos", "Joel": "joe", "Am": "amo", "Ob": "oba", "Jon": "jon", "Mic": "mic", "Nah": "nah", "Hab": "hab", "Zeph": "zep", "Hag": "hag", "Zech": "zac", "Mal": "mal", "1 Mac": "ma1", "2 Mac": "ma2", "Mt": "mat", "Mk": "mar", "Lk": "luk", "Jn": "joh", "Acts": "act", "Rom": "rom", "1 Cor": "co1", "2 Cor": "co2", "Gal": "gal", "Eph": "eph", "Phil": "phi", "Col": "col", "1 Thess": "th1", "2 Thess": "th2", "1 Tim": "ti1", "2 Tim": "ti2", "Tit": "tit", "Philem": "plm", "Heb": "heb", "Jas": "jam", "1 Pet": "pe1", "2 Pet": "pe2", "1 Jn": "jo1", "2 Jn": "jo2", "3 Jn": "jo3", "Jude": "jud", "Apoc": "apo", "Rev": "apo" };
    const bk = Object.keys(abbrevs).find(k => c.toLowerCase().startsWith(k.toLowerCase()));
    if (bk) return `https://www.drbo.org/chapter/${abbrevs[bk]}/${book[2]}.htm`;
  }

  // Doctor-specific works
  if (/confessions/i.test(c) && /augustine/i.test(c)) return "https://www.newadvent.org/fathers/1101.htm";
  if (/city\s*of\s*god/i.test(c)) return "https://www.newadvent.org/fathers/1201.htm";
  if (/introduction\s*to\s*the\s*devout\s*life/i.test(c)) return "https://www.ccel.org/ccel/desales/devout_life.html";
  if (/interior\s*castle/i.test(c)) return "https://www.ccel.org/ccel/teresa/castle2.html";
  if (/dark\s*night/i.test(c)) return "https://www.ccel.org/ccel/john_cross/dark_night.html";
  if (/mind'?s\s*road\s*to\s*god|itinerarium/i.test(c)) return "https://www.ewtn.com/catholicism/library/minds-road-to-god-11357";
  if (/breviloquium/i.test(c)) return "https://www.franciscan-archive.org/bonaventura/opera/breviloquium.html";
  if (/tree\s*of\s*life/i.test(c) && /bonaventure/i.test(c)) return "https://www.ewtn.com/catholicism/library/tree-of-life-11356";
  if (/bonaventure/i.test(c)) return "https://www.franciscan-archive.org/bonaventura/";

  // St. Robert Bellarmine
  if (/art\s*of\s*dying/i.test(c)) return "https://www.ewtn.com/catholicism/library/art-of-dying-well-12498";
  if (/bellarmine/i.test(c)) return "https://www.newadvent.org/cathen/02411d.htm";

  // St. Jerome
  if (/jerome/i.test(c) && /letter/i.test(c)) return "https://www.newadvent.org/fathers/30.htm";
  if (/jerome/i.test(c)) return "https://www.newadvent.org/fathers/30.htm";

  // St. John Chrysostom
  if (/chrysostom/i.test(c) && /homil.*matthew/i.test(c)) return "https://www.newadvent.org/fathers/200101.htm";
  if (/on\s*the\s*priesthood/i.test(c)) return "https://www.newadvent.org/fathers/1901.htm";
  if (/chrysostom/i.test(c) && /marriage/i.test(c)) return "https://www.newadvent.org/fathers/2002.htm";
  if (/chrysostom/i.test(c)) return "https://www.newadvent.org/fathers/20.htm";

  // St. Gregory the Great
  if (/pastoral\s*care|pastoral\s*rule/i.test(c)) return "https://www.newadvent.org/fathers/36011.htm";
  if (/moralia/i.test(c)) return "https://www.newadvent.org/fathers/36.htm";
  if (/gregory.*great/i.test(c) && /dialogue/i.test(c)) return "https://www.newadvent.org/fathers/3604.htm";
  if (/gregory.*great/i.test(c)) return "https://www.newadvent.org/fathers/36.htm";

  // St. Bernard of Clairvaux
  if (/on\s*loving\s*god/i.test(c)) return "https://www.newadvent.org/fathers/3804.htm";
  if (/song\s*of\s*songs/i.test(c) && /bernard/i.test(c)) return "https://www.newadvent.org/fathers/3805.htm";
  if (/on\s*consideration/i.test(c)) return "https://www.ewtn.com/catholicism/library/five-books-on-consideration-11tried";
  if (/bernard.*clairvaux/i.test(c)) return "https://www.newadvent.org/fathers/38.htm";

  // St. Ambrose
  if (/duties\s*of\s*the\s*clergy|de\s*officiis/i.test(c)) return "https://www.newadvent.org/fathers/34021.htm";
  if (/on\s*the\s*mysteries/i.test(c) && /ambrose/i.test(c)) return "https://www.newadvent.org/fathers/3405.htm";
  if (/on\s*repentance|de\s*paenitentia/i.test(c)) return "https://www.newadvent.org/fathers/3407.htm";
  if (/ambrose/i.test(c)) return "https://www.newadvent.org/fathers/34.htm";

  return null;
}

// Renders a citation with optional source link
function SourceLink({ text, extraCheck }) {
  const url = resolveSourceUrl(text) || (extraCheck ? resolveSourceUrl(extraCheck) : null);
  if (!url) return null;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{
      display: "inline-flex", alignItems: "center", gap: 4, marginLeft: 6,
      fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 600,
      color: T.gold, textDecoration: "none", letterSpacing: "0.04em",
      padding: "2px 8px", background: T.goldFaint,
      border: `1px solid ${T.cardBorderStrong}`, borderRadius: 12,
      verticalAlign: "middle",
    }}>↗ Source</a>
  );
}

function parseGuidance(text) {
  const s = { shortAnswer: "", tradition: [], magisterium: [], scripture: [], pastoralWarning: "", calibration: "" };
  try {
    // Strip ALL markdown bold markers: **ANYTHING:** → ANYTHING:
    const t = text.replace(/\*\*([^*]+?)[:\s]*\*\*/g, '$1:').replace(/\*\*/g, '');

    const sa = t.match(/SHORT ANSWER[:\s]*\n([\s\S]*?)(?=\nTRADITION[:\s]|$)/i);
    if (sa) s.shortAnswer = sa[1].trim();
    const tr = t.match(/TRADITION[:\s]*\n([\s\S]*?)(?=\nMAGISTERIUM[:\s]|$)/i);
    if (tr) tr[1].split(/(?=AUTHOR:)/i).filter(e => e.trim()).forEach(e => {
      const a = e.match(/AUTHOR:\s*(.+)/i)?.[1]?.trim()||"";
      const rawQ = e.match(/QUOTE:\s*([\s\S]*?)(?=SOURCE:|$)/i)?.[1]?.trim()||"";
      const isExact = /^"/.test(rawQ);
      const q = rawQ.replace(/^"|"$/g,"").trim();
      const src = e.match(/SOURCE:\s*(.+)/i)?.[1]?.trim()||"";
      if (a||q) s.tradition.push({ author: a, quote: q, source: src, isExact: isExact });
    });
    const mg = t.match(/MAGISTERIUM[:\s]*\n([\s\S]*?)(?=\nSCRIPTURE[:\s]|\nPASTORAL[:\s]|\nCALIBRATION[:\s]|$)/i);
    if (mg) mg[1].split(/(?=REF:)/i).filter(e => e.trim()).forEach(e => {
      const r = e.match(/REF:\s*(.+)/i)?.[1]?.trim()||"", t2 = e.match(/TEACHING:\s*([\s\S]*?)(?=REF:|$)/i)?.[1]?.trim()||"";
      if (r||t2) s.magisterium.push({ ref: r, teaching: t2 });
    });
    const sc = t.match(/SCRIPTURE[:\s]*\n([\s\S]*?)(?=\nPASTORAL[:\s]|\nCALIBRATION[:\s]|$)/i);
    if (sc) sc[1].split(/(?=VERSE:)/i).filter(e => e.trim()).forEach(e => {
      const v = e.match(/VERSE:\s*(.+)/i)?.[1]?.trim()||"", t2 = e.match(/TEXT:\s*([\s\S]*?)(?=VERSE:|$)/i)?.[1]?.trim()||"";
      if (v||t2) s.scripture.push({ verse: v, text: t2 });
    });
    const pw = t.match(/PASTORAL[:\s]*(?:WARNING)?[:\s]*\n([\s\S]*?)(?=\nCALIBRATION[:\s]|$)/i);
    if (pw) s.pastoralWarning = pw[1].trim();
    const cal = t.match(/CALIBRATION[:\s]*\n?([\s\S]*?)$/i);
    if (cal) s.calibration = cal[1].trim();
  } catch(e){}
  if (!s.shortAnswer && !s.tradition.length) s.shortAnswer = text;
  return s;
}

function SeekTab({ goHome, dark, setDark, fszGlobal, setFszGlobal, onSettings, seekStartView, clearStartView }) {
  const [view, setView] = useState("home"); // home|loading|response|sources|privacy
  const [domain, setDomain] = useState(null);
  const [question, setQuestion] = useState("");
  const [guidance, setGuidance] = useState(null);
  const [tradOpen, setTradOpen] = useState(true);
  const [magOpen, setMagOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]); // [{role,content}] for multi-turn
  const [followUp, setFollowUp] = useState("");
  const [pastExchanges, setPastExchanges] = useState([]); // [{question, guidance}] for display
  const [currentQ, setCurrentQ] = useState(""); // the question that produced current guidance
  const [streamingText, setStreamingText] = useState(""); // raw text during streaming
  const [rawResponse, setRawResponse] = useState(null); // raw text for follow-up/dig-deeper (not parsed into cards)
  const ref = useRef(null);
  const followRef = useRef(null);
  const homeRef = useRef(null);

  // Handle navigation from external (e.g. Settings → Privacy)
  useEffect(() => { if (seekStartView) { setView(seekStartView); clearStartView(); } }, [seekStartView]);

  // Scroll to top when returning to home
  useEffect(() => {
    if (view === "home") {
      const scrollToTop = () => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        if (homeRef.current) {
          homeRef.current.scrollTop = 0;
          let el = homeRef.current.parentElement;
          while (el) { el.scrollTop = 0; el = el.parentElement; }
        }
      };
      scrollToTop();
      // Retry after React renders the DOM
      requestAnimationFrame(scrollToTop);
      setTimeout(scrollToTop, 50);
      setTimeout(scrollToTop, 150);
    }
  }, [view]);

  // Format guidance as plain text for copy/share
  const formatGuidanceText = () => {
    if (rawResponse) return rawResponse + "\n\n— Generated by Custos (askcustos.com)\n   A guardian for your conscience";
    if (!guidance) return "";
    let t = "";
    if (guidance.shortAnswer) t += "SHORT ANSWER:\n" + guidance.shortAnswer + "\n\n";
    if (guidance.tradition?.length) {
      t += "TRADITION:\n";
      guidance.tradition.forEach(e => { t += e.author + ": \"" + e.quote + "\" — " + e.source + "\n"; });
      t += "\n";
    }
    if (guidance.magisterium?.length) {
      t += "MAGISTERIUM:\n";
      guidance.magisterium.forEach(e => { t += e.ref + " — " + e.teaching + "\n"; });
      t += "\n";
    }
    if (guidance.scripture?.length) {
      t += "SCRIPTURE:\n";
      guidance.scripture.forEach(e => { t += e.verse + ": " + e.text + "\n"; });
      t += "\n";
    }
    if (guidance.pastoralWarning) t += "PASTORAL:\n" + guidance.pastoralWarning + "\n\n";
    if (guidance.calibration) t += "CERTAINTY: " + guidance.calibration + "\n\n";
    t += "— Generated by Custos (askcustos.com)\n   A guardian for your conscience";
    return t;
  };

  const submit = async (text, isFollowUp = false) => {
    if (!isFollowUp) {
      setQuestion(text);
      setCurrentQ(text);
      setHistory([]);
      setPastExchanges([]);
    } else {
      if ((guidance || rawResponse) && currentQ) {
        setPastExchanges(prev => [...prev, { question: currentQ, guidance: guidance, rawResponse: rawResponse }]);
      }
      setCurrentQ(text);
    }
    setStreamingText("");
    setView("streaming");
    try {
      const body = isFollowUp
        ? { question: text.trim(), history: history }
        : { question: text.trim(), domain: domain ? domain.label : null };

      const r = await fetch("/api/guidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!r.ok) {
        const errData = await r.json().catch(() => ({}));
        throw new Error(errData.error || "Server error");
      }

      const reader = r.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === "content_block_delta" && parsed.delta?.text) {
                fullText += parsed.delta.text;
                setStreamingText(fullText);
              }
            } catch(e) { /* skip non-JSON lines */ }
          }
        }
      }

      if (!fullText.trim()) throw new Error("Empty response");

      const userMsg = isFollowUp
        ? { role: "user", content: text.trim() }
        : { role: "user", content: domain ? "Domain: " + domain.label + ". My question: " + text.trim() : "My question: " + text.trim() };
      setHistory([...history, userMsg, { role: "assistant", content: fullText }]);
      if (isFollowUp) {
        setRawResponse(fullText);
        setGuidance(null);
      } else {
        setRawResponse(null);
        setGuidance(parseGuidance(fullText));
      }
      setFollowUp("");
      setView("response");
    } catch(e) {
      setGuidance({
        shortAnswer: "Custos was unable to generate guidance. Please try again.",
        tradition: [], magisterium: [], scripture: [],
        pastoralWarning: "If this persists, consider consulting your parish priest or the Baltimore Catechism directly.",
        calibration: e.message || "Connection error"
      });
      setView("response");
    }
  };

  return (
    <>
      {view === "home" && (
        <div ref={homeRef} style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px" }}>
          {/* Custos header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "18px 0 6px" }}>
            <div style={{ width: 70 }} />
            <div style={{ textAlign: "center", flex: 1 }}>
              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 52, height: 52, borderRadius: "50%", background: T.goldFaint, border: "1.5px solid rgba(212,168,67,0.2)", marginBottom: 6 }}>
                <svg width="32" height="32" viewBox="0 0 512 512" fill="none">
                  <path d="M220 270 C195 250,150 210,100 175 C75 160,55 165,52 180 C48 200,65 225,95 245 C130 268,180 275,220 270Z" fill={T.gold} opacity="0.5"/>
                  <path d="M292 270 C317 250,362 210,412 175 C437 160,457 165,460 180 C464 200,447 225,417 245 C382 268,332 275,292 270Z" fill={T.gold} opacity="0.5"/>
                  <ellipse cx="256" cy="160" rx="48" ry="14" fill="none" stroke={T.gold} strokeWidth="8" opacity="0.65"/>
                  <circle cx="256" cy="198" r="35" fill={T.gold} opacity="0.18" stroke={T.gold} strokeWidth="6" strokeOpacity="0.55"/>
                  <path d="M224 230 L210 390 C210 403,222 412,238 412 L274 412 C290 412,302 403,302 390 L288 230 C276 248,236 248,224 230Z" fill={T.navy} opacity="0.85"/>
                  <path d="M224 230 L210 390 C210 403,222 412,238 412 L274 412 C290 412,302 403,302 390 L288 230 C276 248,236 248,224 230Z" fill={T.gold} opacity="0.15" stroke={T.gold} strokeWidth="5" strokeOpacity="0.45"/>
                  <line x1="256" y1="275" x2="256" y2="325" stroke={T.gold} strokeWidth="7" opacity="0.7" strokeLinecap="round"/>
                  <line x1="242" y1="290" x2="270" y2="290" stroke={T.gold} strokeWidth="7" opacity="0.7" strokeLinecap="round"/>
                </svg>
              </div>
              <h1 style={{ fontFamily: "Cinzel, serif", fontSize: fz(28), fontWeight: 400, color: T.navyText, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 4px" }}>Custos</h1>
              <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(15), fontStyle: "italic", color: T.inkLight, margin: 0 }}>A guardian for your conscience</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, width: 70, justifyContent: "flex-end", paddingTop: 4 }}>
              <button onClick={() => setFszGlobal((fszGlobal + 1) % 3)} style={{ background: "none", border: `1px solid ${T.cardBorder}`, borderRadius: 6, cursor: "pointer", fontFamily: "Cinzel, serif", fontSize: 12, fontWeight: 700, color: T.inkLight, padding: "2px 7px", lineHeight: 1.4 }}>{["A⁻", "A", "A⁺"][fszGlobal]}</button>
              <button onClick={() => setDark(!dark)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: fz(18), padding: 0, width: 24, lineHeight: 1, color: T.inkLight }}>{dark ? "☀" : "☽"}</button>
              <button onClick={onSettings} style={{ background: "none", border: "none", cursor: "pointer", fontSize: fz(16), padding: 0, width: 20, lineHeight: 1, color: T.inkLight }}>⚙</button>
            </div>
          </div>

          {/* Welcome line */}
          <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(16), color: T.inkMid, textAlign: "center", lineHeight: 1.55, margin: "10px 10px 0", fontStyle: "italic" }}>When you need the Church's wisdom, not the world's opinion</p>

          {/* Main input */}
          <div style={{ marginTop: 20 }}>
            <textarea ref={ref} value={question} onChange={e => setQuestion(e.target.value)} placeholder="What are you facing? Describe your situation…" rows={4} style={{
              width: "100%", padding: 16, fontFamily: "EB Garamond, serif", fontSize: fz(17), lineHeight: 1.6,
              color: T.inkDark, background: T.warmWhite, border: `1.5px solid ${T.cardBorderStrong}`,
              borderRadius: 12, resize: "none", boxSizing: "border-box",
            }} onFocus={e => e.target.style.borderColor = T.gold} onBlur={e => e.target.style.borderColor = T.cardBorderStrong} />

            <button onClick={() => { if (question.trim()) submit(question); }} style={{
              display: "block", width: "100%", padding: "14px 0", marginTop: 12,
              fontFamily: "Cinzel, serif", fontSize: fz(13), fontWeight: 600,
              letterSpacing: "0.08em", textTransform: "uppercase",
              color: T.warmWhite,
              background: question.trim() ? `linear-gradient(135deg, ${T.crimson}, ${T.crimsonLight})` : T.inkLight,
              border: "none", borderRadius: 10, cursor: question.trim() ? "pointer" : "default",
              boxShadow: question.trim() ? `0 3px 12px ${T.shadowCrimson}` : "none",
              opacity: question.trim() ? 1 : 0.5,
              transition: "all 0.3s ease",
            }}>Seek Guidance</button>

            <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", marginTop: 10 }}>
              <span style={{ fontSize: fz(12) }}>🔒</span>
              <span style={{ fontFamily: "EB Garamond, serif", fontSize: fz(12.5), color: T.inkLight }}>Never stored — sent only to generate guidance</span>
            </div>
          </div>

          {/* Starter prompts — general or domain-specific */}
          {!question.trim() && !domain && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 700, color: T.inkLight, letterSpacing: "0.1em", textTransform: "uppercase", textAlign: "center", marginBottom: 10 }}>Common theological questions</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  "Is it a sin to miss Mass when I have to work?",
                  "My spouse wants to pursue IVF. What does the Church teach?",
                  "How do I forgive someone who deeply hurt my family?",
                  "Is removing life support the same as euthanasia?",
                  "I haven't been to Confession in years. Where do I start?",
                ].map((prompt, i) => (
                  <button key={i} onClick={() => { setQuestion(prompt); }} style={{
                    display: "flex", alignItems: "center", gap: 10, width: "100%",
                    padding: "11px 14px", background: T.warmWhite,
                    border: `1px solid ${T.cardBorder}`, borderRadius: 10,
                    cursor: "pointer", textAlign: "left",
                    transition: "border-color 0.2s ease",
                  }}>
                    <span style={{ color: T.gold, fontSize: 14, flexShrink: 0 }}>›</span>
                    <span style={{ fontFamily: "EB Garamond, serif", fontSize: fz(15), color: T.inkMid, lineHeight: 1.4 }}>{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {!question.trim() && domain && domain.prompts && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 700, color: T.gold, letterSpacing: "0.1em", textTransform: "uppercase", textAlign: "center", marginBottom: 10 }}>{domain.label}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {domain.prompts.map((prompt, i) => (
                  <button key={i} onClick={() => { setQuestion(prompt); }} style={{
                    display: "flex", alignItems: "center", gap: 10, width: "100%",
                    padding: "11px 14px", background: T.warmWhite,
                    border: `1px solid rgba(212,168,67,0.25)`, borderRadius: 10,
                    cursor: "pointer", textAlign: "left",
                  }}>
                    <span style={{ color: T.gold, fontSize: 14, flexShrink: 0 }}>›</span>
                    <span style={{ fontFamily: "EB Garamond, serif", fontSize: fz(15), color: T.inkDark, lineHeight: 1.4 }}>{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Domain chips */}
          <div style={{ marginTop: 22 }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 700, color: T.inkLight, letterSpacing: "0.1em", textTransform: "uppercase", textAlign: "center", marginBottom: 10 }}>Or browse by domain</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {DOMAINS.map(d => (
                <button key={d.id} onClick={() => {
                  setDomain(domain?.id === d.id ? null : d);
                  if (domain?.id !== d.id) setQuestion("");
                }} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 14px",
                  background: domain?.id === d.id ? T.goldFaint : T.warmWhite,
                  border: `1.5px solid ${domain?.id === d.id ? T.gold : T.cardBorder}`,
                  borderRadius: 20, cursor: "pointer",
                  transition: "all 0.2s ease",
                }}>
                  <span style={{ fontSize: 15 }}>{d.icon}</span>
                  <span style={{ fontFamily: "EB Garamond, serif", fontSize: fz(14), color: domain?.id === d.id ? T.navyText : T.inkMid }}>{d.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Selected domain indicator */}
          {domain && (
            <div style={{ marginTop: 14, padding: "8px 14px", background: T.goldFaint, borderRadius: 10, textAlign: "center", border: `1px solid ${T.cardBorderStrong}`, display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 15 }}>{domain.icon}</span>
              <span style={{ fontFamily: "EB Garamond, serif", fontSize: fz(14), color: T.inkDark }}>Focused on <strong>{domain.label}</strong></span>
              <button onClick={() => setDomain(null)} style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), color: T.inkLight, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>clear</button>
            </div>
          )}

          {/* Disclaimer & Sources link */}
          <div style={{ marginTop: 28, padding: "12px 14px", background: T.subtleBg, borderRadius: 10, textAlign: "center" }}>
            <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(13), fontStyle: "italic", color: T.inkLight, margin: "0 0 8px", lineHeight: 1.5 }}>
              Custos draws exclusively from a closed set of approved Catholic sources. It supplements — never replaces — a confessor or spiritual director.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
              <button onClick={() => setView("sources")} style={{ fontFamily: "Cinzel, serif", fontSize: fz(11), fontWeight: 600, color: T.gold, background: "none", border: "none", cursor: "pointer", letterSpacing: "0.06em", textDecoration: "underline", textDecorationColor: "rgba(212,168,67,0.4)", textUnderlineOffset: 3 }}>📖 Our Sources</button>
              <button onClick={() => setView("privacy")} style={{ fontFamily: "Cinzel, serif", fontSize: fz(11), fontWeight: 600, color: T.gold, background: "none", border: "none", cursor: "pointer", letterSpacing: "0.06em", textDecoration: "underline", textDecorationColor: "rgba(212,168,67,0.4)", textUnderlineOffset: 3 }}>🔒 Your Privacy</button>
            </div>
          </div>
        </div>
      )}
      {view === "loading" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
          <div style={{ width: 40, height: 40, border: `2.5px solid ${T.goldFaint}`, borderTopColor: T.gold, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(17), color: T.inkLight, fontStyle: "italic", animation: "pulse 2s ease infinite" }}>Consulting the Tradition…</p>
        </div>
      )}
      {view === "streaming" && (
        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 30 }}>
          <TopBar title="Guidance" showBack={true} onBack={() => { setView("home"); setCopied(false); setPastExchanges([]); setCurrentQ(""); setHistory([]); }} />
          {currentQ && (
            <div style={{ margin: "12px 20px 0" }}>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 700, color: T.gold, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>Your question</div>
              <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(15), color: T.inkDark, fontStyle: "italic", margin: 0, lineHeight: 1.45 }}>{currentQ}</p>
            </div>
          )}
          <Card style={{ margin: "12px 20px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <CardTitle>Consulting the Tradition</CardTitle>
              <div style={{ width: 12, height: 12, border: `2px solid ${T.goldFaint}`, borderTopColor: T.gold, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            </div>
            <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(16), color: T.inkDark, lineHeight: 1.65, margin: 0, whiteSpace: "pre-wrap" }}>{streamingText || "…"}</p>
          </Card>
        </div>
      )}
      {view === "response" && (guidance || rawResponse) && (
        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 30 }}>
          <TopBar title="Guidance" showBack={true} onBack={() => { setView("home"); setCopied(false); setPastExchanges([]); setCurrentQ(""); setHistory([]); }} />
          {domain && <div style={{ padding: "14px 20px 0" }}><span style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 600, color: T.gold, letterSpacing: "0.08em", textTransform: "uppercase" }}>{domain.label}</span></div>}

          {/* Previous exchanges in this conversation */}
          {pastExchanges.length > 0 && (
            <div style={{ margin: "12px 20px 0" }}>
              {pastExchanges.map((ex, i) => (
                <div key={i} style={{ marginBottom: 10, padding: "12px 14px", background: T.subtleBg, borderRadius: 10, border: `1px solid ${T.cardBorder}` }}>
                  <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 700, color: T.gold, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Question {i + 1}</div>
                  <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(14), color: T.inkMid, fontStyle: "italic", margin: "0 0 8px", lineHeight: 1.45 }}>{ex.question}</p>
                  <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(13), color: T.inkLight, margin: 0, lineHeight: 1.45 }}>{(ex.rawResponse || ex.guidance?.shortAnswer || "").substring(0, 200)}{(ex.rawResponse || ex.guidance?.shortAnswer || "").length > 200 ? "…" : ""}</p>
                </div>
              ))}
              <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 700, color: T.gold, letterSpacing: "0.06em", textTransform: "uppercase", margin: "6px 0 4px" }}>Follow-up {pastExchanges.length}</div>
              <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(14), color: T.inkDark, fontStyle: "italic", margin: "0 0 4px", padding: "0 2px" }}>{currentQ}</p>
            </div>
          )}

          {/* Current question (first question only) */}
          {pastExchanges.length === 0 && currentQ && (
            <div style={{ margin: "12px 20px 0" }}>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 700, color: T.gold, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>Your question</div>
              <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(15), color: T.inkDark, fontStyle: "italic", margin: 0, lineHeight: 1.45 }}>{currentQ}</p>
            </div>
          )}

          {/* Raw text response for follow-ups and Dig Deeper */}
          {rawResponse && !guidance && (
            <>
              <Card style={{ margin: "12px 20px 0" }}>
                <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(16), color: T.inkDark, lineHeight: 1.65, margin: 0, whiteSpace: "pre-wrap" }}>{rawResponse}</p>
              </Card>
            </>
          )}

          {/* Structured guidance cards */}
          {guidance && <>
          <Card style={{ margin: "12px 20px 0" }}><CardTitle>The Short Answer</CardTitle><p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(18), color: T.inkDark, lineHeight: 1.6, margin: 0 }}>{guidance.shortAnswer}</p></Card>
          {guidance.tradition.length > 0 && <Card style={{ margin: "12px 20px 0" }}>
            <button onClick={() => setTradOpen(!tradOpen)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "none", border: "none", cursor: "pointer", padding: 0 }}><CardTitle>What the Tradition Says</CardTitle><span style={{ color: T.gold, fontSize: fz(14), transform: tradOpen ? "rotate(0)" : "rotate(180deg)", transition: "transform 0.3s" }}>▴</span></button>
            {tradOpen && <div style={{ marginTop: 12 }}>{guidance.tradition.map((e,i) => <div key={i} style={{ marginBottom: 16 }}>
              <SaintQuote name={e.author} quote={e.quote} source={e.source} isExact={e.isExact} />
              <SourceLink text={e.source} extraCheck={e.author + " " + (e.source || "")} />
            </div>)}</div>}
          </Card>}
          {guidance.magisterium.length > 0 && <Card style={{ margin: "12px 20px 0" }}>
            <button onClick={() => setMagOpen(!magOpen)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "none", border: "none", cursor: "pointer", padding: 0 }}><CardTitle>The Church Teaches</CardTitle><span style={{ color: T.navyText, fontSize: fz(14), transform: magOpen ? "rotate(0)" : "rotate(180deg)", transition: "transform 0.3s" }}>▾</span></button>
            {magOpen && <div style={{ marginTop: 12 }}>{guidance.magisterium.map((e,i) => <div key={i} style={{ borderLeft: `3px solid ${T.navyText}`, paddingLeft: 16, marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(11), fontWeight: 700, color: T.navyText, letterSpacing: "0.05em" }}>{e.ref}</div>
                <SourceLink text={e.ref} />
              </div>
              <div style={{ fontFamily: "EB Garamond, serif", fontSize: fz(15), color: T.inkDark, lineHeight: 1.55 }}>{e.teaching}</div>
            </div>)}</div>}
          </Card>}
          {guidance.scripture && guidance.scripture.length > 0 && <Card style={{ margin: "12px 20px 0" }}>
            <CardTitle color={T.crimson}>Sacred Scripture</CardTitle>
            <div style={{ marginTop: 8 }}>{guidance.scripture.map((e,i) => <div key={i} style={{ borderLeft: `3px solid ${T.crimson}`, paddingLeft: 14, marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(11), fontWeight: 700, color: T.crimson, letterSpacing: "0.05em" }}>{e.verse}</div>
                <SourceLink text={e.verse} />
              </div>
              <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(16), fontStyle: "italic", color: T.inkDark, lineHeight: 1.6, margin: 0 }}>{e.text}</p>
            </div>)}</div>
          </Card>}
          {guidance && guidance.calibration && <div style={{ margin: "12px 20px 0", padding: "10px 14px", background: "rgba(26,39,68,0.04)", borderRadius: 8 }}><div style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 700, color: T.navyLight, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>Certainty</div><p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(14), color: T.inkMid, fontStyle: "italic", margin: 0 }}>{guidance.calibration}</p></div>}
          {guidance && guidance.pastoralWarning && <Card style={{ margin: "12px 20px 0" }}><CardTitle>Conclusion</CardTitle><p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(15), color: T.inkDark, lineHeight: 1.6, margin: 0 }}>{guidance.pastoralWarning}</p></Card>}
          </>}
          <div style={{ display: "flex", gap: 8, margin: "20px 20px 0" }}>
            <button onClick={() => { setQuestion(""); setView("home"); setCopied(false); setHistory([]); setFollowUp(""); setPastExchanges([]); setCurrentQ(""); setRawResponse(null); }} style={{ flex: 1, padding: "11px 0", fontFamily: "Cinzel, serif", fontSize: fz(11), fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: T.navyText, background: T.warmWhite, border: "1px solid rgba(26,39,68,0.2)", borderRadius: 10, cursor: "pointer" }}>💬 New question</button>
            <button onClick={() => { navigator.clipboard.writeText(formatGuidanceText()).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }).catch(() => {}); }} style={{ flex: 1, padding: "11px 0", fontFamily: "Cinzel, serif", fontSize: fz(11), fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: copied ? T.gold : T.inkLight, background: copied ? T.goldFaint : T.warmWhite, border: `1px solid ${copied ? T.gold : "rgba(138,126,108,0.2)"}`, borderRadius: 10, cursor: "pointer" }}>{copied ? "✓ Copied" : "📋 Copy"}</button>
            <button onClick={() => { if (navigator.share) { navigator.share({ title: "Custos — Moral Guidance", text: formatGuidanceText() }).catch(() => {}); } else { navigator.clipboard.writeText(formatGuidanceText()).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }).catch(() => {}); } }} style={{ flex: 1, padding: "11px 0", fontFamily: "Cinzel, serif", fontSize: fz(11), fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: T.inkLight, background: T.warmWhite, border: "1px solid rgba(138,126,108,0.2)", borderRadius: 10, cursor: "pointer" }}>↗ Share</button>
          </div>

          {/* Dig Deeper */}
          <div style={{ margin: "20px 20px 0" }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 700, color: T.gold, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8, textAlign: "center" }}>Dig Deeper</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { icon: "🔍", label: "Explain the reasoning", prompt: "Explain the reasoning behind this teaching. Walk me through the natural law argument, the theology of the act, and why the Church arrived at this position. Assume I'm a faithful Catholic who wants to understand, not just obey." },
                { icon: "🏛", label: "What do the Doctors teach?", prompt: "Explain what the Doctors of the Church you cited actually teach on this topic. Use plain, accessible language — as if you were explaining their ideas to someone who hasn't read their works. Include what makes each Doctor's perspective distinctive." },
                { icon: "📖", label: "Break down the sources", prompt: "Break down the encyclicals, catechism passages, and other sources you cited. For each one, explain in plain language: what does it actually say, what problem was it addressing when it was written, and how does it apply to my question?" },
                { icon: "💡", label: "Give me an analogy", prompt: "Explain this teaching using analogies and everyday language that a non-theologian would understand. Help me grasp the underlying principle, not just the rule. Use comparisons from ordinary life, relationships, or common experience." },
              ].map((d, i) => (
                <button key={i} onClick={() => submit(d.prompt, true)} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
                  fontFamily: "EB Garamond, serif", fontSize: fz(14), color: T.navyText,
                  background: T.warmWhite, border: `1px solid ${T.cardBorderStrong}`,
                  borderRadius: 10, cursor: "pointer", textAlign: "left", lineHeight: 1.3,
                }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{d.icon}</span>
                  <span>{d.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Follow-up input */}
          <div style={{ margin: "16px 20px 0", display: "flex", gap: 8 }}>
            <input ref={followRef} type="text" value={followUp} onChange={e => setFollowUp(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && followUp.trim()) submit(followUp, true); }} placeholder="Ask a follow-up…" style={{ flex: 1, padding: "12px 14px", fontFamily: "EB Garamond, serif", fontSize: fz(15), color: T.inkDark, background: T.warmWhite, border: `1px solid ${T.cardBorderStrong}`, borderRadius: 10, boxSizing: "border-box" }} />
            <button onClick={() => { if (followUp.trim()) submit(followUp, true); }} disabled={!followUp.trim()} style={{ padding: "12px 18px", fontFamily: "Cinzel, serif", fontSize: fz(11), fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: followUp.trim() ? T.warmWhite : T.inkLight, background: followUp.trim() ? `linear-gradient(135deg, ${T.crimson}, ${T.crimsonLight})` : T.warmWhite, border: followUp.trim() ? "none" : `1px solid ${T.cardBorder}`, borderRadius: 10, cursor: followUp.trim() ? "pointer" : "default", boxShadow: followUp.trim() ? `0 2px 8px ${T.shadowCrimson}` : "none" }}>Ask</button>
          </div>

          <div style={{ margin: "16px 20px 0", padding: "10px 0", borderTop: `1px solid ${T.cardBorder}`, textAlign: "center" }}><p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(13), color: T.inkLight, fontStyle: "italic", margin: 0 }}>This guidance supplements — never replaces — a confessor or spiritual director.</p></div>
        </div>
      )}
      {view === "sources" && (
        <div style={{ flex: 1, overflowY: "auto" }}>
          <TopBar title="Our Sources" showBack={true} onBack={() => setView("home")} />
          <div style={{ padding: "14px 20px 30px" }}>
            <div style={{ textAlign: "center", marginBottom: 18 }}>
              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 52, height: 52, borderRadius: "50%", background: T.goldFaint, border: "1.5px solid rgba(212,168,67,0.2)", marginBottom: 8 }}><span style={{ fontSize: fz(22) }}>📖</span></div>
              <h2 style={{ fontFamily: "Cinzel, serif", fontSize: fz(20), fontWeight: 500, color: T.inkDark, margin: "0 0 4px" }}>Closed Universe</h2>
              <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(14), fontStyle: "italic", color: T.inkLight, margin: 0, lineHeight: 1.5, maxWidth: 300, marginLeft: "auto", marginRight: "auto" }}>Custos draws exclusively from these 56 approved sources — nothing else. No blogs, no modern theologians, no unnamed scholars.</p>
            </div>

            {[
              {
                label: "Sacred Scripture",
                count: null,
                items: [
                  { text: "Douay-Rheims Bible — required for all quotations" },
                  { text: "The Vulgate — Latin reference" },
                ]
              },
              {
                label: "Catechisms",
                count: "4",
                items: [
                  { text: "The Baltimore Catechism" },
                  { text: "The Catechism of the Council of Trent (Roman Catechism)" },
                  { text: "The Catechism of Pope St. Pius X" },
                  { text: "Catechism of the Catholic Church (1992) — supplementary only; may not override the older catechisms" },
                ]
              },
              {
                label: "Papal Encyclicals & Apostolic Documents",
                count: "21",
                items: [
                  { text: "Mirari Vos — Gregory XVI, 1832" },
                  { text: "Quanta Cura & Syllabus of Errors — Pius IX, 1864" },
                  { text: "Aeterni Patris — Leo XIII, 1879" },
                  { text: "Immortale Dei — Leo XIII, 1885" },
                  { text: "Libertas — Leo XIII, 1888" },
                  { text: "Rerum Novarum — Leo XIII, 1891" },
                  { text: "Pascendi Dominici Gregis — Pius X, 1907" },
                  { text: "Mortalium Animos — Pius XI, 1928" },
                  { text: "Casti Connubii — Pius XI, 1930" },
                  { text: "Quadragesimo Anno — Pius XI, 1931" },
                  { text: "Divini Redemptoris — Pius XI, 1937" },
                  { text: "Mit brennender Sorge — Pius XI, 1937" },
                  { text: "Mystici Corporis Christi — Pius XII, 1943" },
                  { text: "Mediator Dei — Pius XII, 1947" },
                  { text: "Humani Generis — Pius XII, 1950" },
                  { text: "Humanae Vitae — Paul VI, 1968" },
                  { text: "Familiaris Consortio — John Paul II, 1981" },
                  { text: "Veritatis Splendor — John Paul II, 1993" },
                  { text: "Evangelium Vitae — John Paul II, 1995" },
                  { text: "Fides et Ratio — John Paul II, 1998" },
                  { text: "Deus Caritas Est — Benedict XVI, 2005" },
                ]
              },
              {
                label: "Motu Proprio",
                count: "4",
                items: [
                  { text: "Ecclesia Dei — John Paul II, 1988" },
                  { text: "Ad Tuendam Fidem — John Paul II, 1998" },
                  { text: "Summorum Pontificum — Benedict XVI, 2007" },
                  { text: "Omnium in Mentem — Benedict XVI, 2009" },
                ]
              },
              {
                label: "CDF Instructions — Approved In Forma Specifica",
                count: "3",
                note: "The Pope formally ratified each of these, making them his own act. They carry authority equivalent to an encyclical.",
                items: [
                  { text: "Persona Humana — CDF, 1975 · approved in forma specifica by Paul VI · on sexual ethics" },
                  { text: "Inter Insigniores — CDF, 1976 · approved in forma specifica by Paul VI · on the ordination of women" },
                  { text: "Dominus Iesus — CDF, 2000 · approved in forma specifica by John Paul II · on Christ as the sole Saviour" },
                ]
              },
              {
                label: "CDF Instructions — Approved In Common Form",
                count: "2",
                note: "The Pope gave general approval but did not formally ratify these as his own act. They carry real but delegated authority. Retained because no encyclical addresses these bioethical questions.",
                items: [
                  { text: "Donum Vitae — CDF, 1987 · approved in common form by John Paul II · IVF, artificial insemination, embryo research" },
                  { text: "Dignitas Personae — CDF, 2008 · approved in common form by Benedict XVI · embryo adoption, cloning, stem cells" },
                ]
              },
              {
                label: "Church Councils",
                count: "4",
                items: [
                  { text: "Fourth Lateran Council (1215) — Transubstantiation, annual confession, marriage impediments" },
                  { text: "Council of Florence (1438–1445) — seven sacraments, extra ecclesiam nulla salus" },
                  { text: "Council of Trent — dogmatic canons and decrees, highest conciliar authority" },
                  { text: "Vatican I — Pastor Aeternus on papal infallibility" },
                ]
              },
              {
                label: "Doctors of the Church",
                count: "15",
                items: [
                  { text: "St. Thomas Aquinas · St. Augustine of Hippo · St. Alphonsus Liguori" },
                  { text: "St. Francis de Sales · St. Teresa of Ávila · St. John of the Cross" },
                  { text: "St. Catherine of Siena · St. Bonaventure · St. Robert Bellarmine" },
                  { text: "St. Jerome · St. John Chrysostom · St. Gregory the Great" },
                  { text: "St. Bernard of Clairvaux · St. Ambrose of Milan · St. Thérèse of Lisieux" },
                ]
              },
              {
                label: "Canon Law",
                count: "2 Codes",
                note: "When both codes address a question, Custos cites both so you can see exactly what changed and whether it was a tightening, relaxation, or reformulation of the discipline.",
                items: [
                  { text: "1917 Code of Canon Law — the law of the Church from 1917 until 1983" },
                  { text: "1983 Code of Canon Law — the current law of the Church" },
                ]
              },
            ].map((section, si) => (
              <div key={si} style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", paddingBottom: 5, borderBottom: `1px solid ${T.cardBorder}`, marginBottom: 8 }}>
                  <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(11), fontWeight: 700, color: T.navyText, letterSpacing: "0.06em", textTransform: "uppercase" }}>{si + 1}. {section.label}</div>
                  {section.count && <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 600, color: T.gold, letterSpacing: "0.04em", flexShrink: 0, marginLeft: 8 }}>{section.count}</div>}
                </div>
                {section.note && (
                  <div style={{ fontFamily: "EB Garamond, serif", fontSize: fz(13), fontStyle: "italic", color: T.inkMid, lineHeight: 1.5, marginBottom: 8, paddingLeft: 8, borderLeft: `2px solid ${T.goldFaint}` }}>{section.note}</div>
                )}
                {section.items.map((item, ii) => (
                  <div key={ii} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "4px 0 4px 8px" }}>
                    <span style={{ color: T.gold, fontSize: fz(10), marginTop: 4, flexShrink: 0 }}>•</span>
                    <span style={{ fontFamily: "EB Garamond, serif", fontSize: fz(14.5), color: T.inkDark, lineHeight: 1.45 }}>{item.text}</span>
                  </div>
                ))}
              </div>
            ))}

            <div style={{ marginTop: 4, padding: "14px", background: "rgba(122,28,28,0.04)", borderRadius: 10, border: "1px solid rgba(122,28,28,0.1)" }}>
              <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(14), color: T.crimson, fontWeight: 500, margin: "0 0 6px" }}>What we do not cite:</p>
              <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(13.5), color: T.inkMid, margin: 0, lineHeight: 1.5 }}>No Vatican II documents. No Pontifical Academy for Life. No USCCB committee documents. No Catholic news sites. No modern theologians. No unnamed "scholars." If a question exceeds these sources, Custos will tell you honestly and direct you to a confessor.</p>
            </div>

            <div style={{ marginTop: 18, textAlign: "center" }}>
              <button onClick={() => setView("home")} style={{ padding: "14px 40px", fontFamily: "Cinzel, serif", fontSize: fz(13), fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: T.warmWhite, background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`, border: "none", borderRadius: 10, cursor: "pointer" }}>Return to Seek</button>
            </div>
          </div>
        </div>
      )}
      {view === "privacy" && (
        <div style={{ flex: 1, overflowY: "auto" }}>
          <TopBar title="Your Privacy" showBack={true} onBack={() => setView("home")} />
          <div style={{ padding: "14px 20px 30px" }}>
            <div style={{ textAlign: "center", marginBottom: 18 }}>
              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 52, height: 52, borderRadius: "50%", background: T.goldFaint, border: "1.5px solid rgba(212,168,67,0.2)", marginBottom: 8 }}><span style={{ fontSize: fz(22) }}>🔒</span></div>
              <h2 style={{ fontFamily: "Cinzel, serif", fontSize: fz(20), fontWeight: 500, color: T.inkDark, margin: "0 0 4px" }}>Your Privacy</h2>
              <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(15), fontStyle: "italic", color: T.inkLight, margin: 0, lineHeight: 1.5, maxWidth: 300, marginLeft: "auto", marginRight: "auto" }}>Your moral questions are between you, the guidance engine, and God.</p>
            </div>

            <Card style={{ marginBottom: 14 }}>
              <CardTitle color={T.navyText}>We do not store your questions</CardTitle>
              <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(15), color: T.inkDark, lineHeight: 1.6, margin: 0 }}>When you ask Custos a question, it is sent to the guidance engine, a response is generated, and the question is immediately discarded. No question text is saved to any database, log, or file. We cannot read, review, or retrieve what you have asked.</p>
            </Card>

            <Card style={{ marginBottom: 14 }}>
              <CardTitle color={T.navyText}>No accounts, no tracking</CardTitle>
              <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(15), color: T.inkDark, lineHeight: 1.6, margin: 0 }}>Custos does not require an account, does not use cookies for tracking, and does not collect personal information. There is no analytics tracking individual users. We do not know who you are, where you are, or what you have asked.</p>
            </Card>

            <Card style={{ marginBottom: 14 }}>
              <CardTitle color={T.navyText}>How it works technically</CardTitle>
              <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(15), color: T.inkDark, lineHeight: 1.6, margin: 0 }}>Your question is sent from your device to our server, which adds the theological source instructions and forwards it to the AI guidance engine (Anthropic's Claude). The response is returned to your device. Our server is stateless — it processes each request and immediately forgets it. Anthropic's API does not store conversations by default.</p>
            </Card>

            <Card style={{ marginBottom: 14 }}>
              <CardTitle color={T.navyText}>The seal of the confessional as our model</CardTitle>
              <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(15), color: T.inkDark, lineHeight: 1.6, margin: 0 }}>While Custos is not a sacrament and cannot replace confession, we take the same principle seriously: what you bring to Custos in good faith seeking moral guidance should be treated with the reverence that the subject demands. We built the system so that privacy is not a policy we choose to follow — it is an architectural reality. We cannot betray your trust because we never hold the information in the first place.</p>
            </Card>

            <Card style={{ borderLeft: `3px solid ${T.gold}` }}>
              <CardTitle color={T.gold}>A note on limitations</CardTitle>
              <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(15), color: T.inkDark, lineHeight: 1.6, margin: 0 }}>Custos is an AI-assisted tool, not a priest, confessor, or spiritual director. For matters touching the internal forum — mortal sin, the state of your soul, marriage validity — please bring your question to a priest. We recommend speaking with your parish priest, or contacting a local Opus Dei center for ongoing spiritual direction.</p>
            </Card>

            <div style={{ marginTop: 18, textAlign: "center" }}>
              <button onClick={() => setView("home")} style={{ padding: "14px 40px", fontFamily: "Cinzel, serif", fontSize: fz(13), fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: T.warmWhite, background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`, border: "none", borderRadius: 10, cursor: "pointer" }}>Return to Seek</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
// ═══════════════════════════════════════════════════════════════════
// DAILY EXAMEN
// ═══════════════════════════════════════════════════════════════════
function ExamenTab() {
  const [view, setView] = useState("welcome");
  const [step, setStep] = useState(0);
  const [reflections, setReflections] = useState({});
  const [fade, setFade] = useState(true);

  useEffect(() => { setFade(false); setTimeout(() => setFade(true), 50); }, [step]);

  const s = EXAMEN_STEPS[step];
  const title = view === "summary" ? "Examen Complete" : "Daily Examen";

  return (
    <>
      <TopBar title={title} showBack={view !== "welcome"} onBack={() => {
        if (view === "examen" && step > 0) setStep(step - 1);
        else if (view === "summary") setView("welcome");
        else setView("welcome");
      }} />
      {view === "welcome" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 22px" }}>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: "50%", background: T.goldFaint, border: "1.5px solid rgba(212,168,67,0.2)" }}><span style={{ fontSize: fz(28) }}>🕯</span></div>
          </div>
          <h2 style={{ fontFamily: "Cinzel, serif", fontSize: fz(24), fontWeight: 500, color: T.inkDark, textAlign: "center", margin: "0 0 4px" }}>Daily Examen</h2>
          <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(15), fontStyle: "italic", color: T.gold, textAlign: "center", margin: "0 0 20px" }}>In the tradition of St. Ignatius of Loyola</p>
          <Card style={{ marginBottom: 20 }}>
            <CardTitle>The Five Movements</CardTitle>
            {["I · Stillness — Place yourself in God's presence", "II · Gratitude — Give thanks for the day's gifts", "III · Review — Walk through your day with God", "IV · Sorrow — Acknowledge failings with mercy", "V · Resolution — Look ahead with grace"].map((s2,i) => (
              <div key={i} style={{ fontFamily: "EB Garamond, serif", fontSize: fz(15), color: T.inkDark, lineHeight: 1.5, marginBottom: i < 4 ? 8 : 0 }}>{s2}</div>
            ))}
          </Card>
          <CrimsonBtn onClick={() => { setStep(0); setReflections({}); setView("examen"); }}>Begin Examen</CrimsonBtn>
          <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(13), color: T.inkLight, fontStyle: "italic", textAlign: "center", marginTop: 14 }}>Notes are stored only on your device</p>
        </div>
      )}
      {view === "examen" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", opacity: fade ? 1 : 0, transform: fade ? "translateY(0)" : "translateY(10px)", transition: "all 0.4s ease" }}>
          {/* Progress */}
          <div style={{ display: "flex", gap: 5, justifyContent: "center", padding: "14px 0 6px" }}>
            {EXAMEN_STEPS.map((_, i) => <div key={i} style={{ width: i === step ? 24 : 7, height: 7, borderRadius: 4, background: i <= step ? T.gold : "rgba(212,168,67,0.2)", opacity: i < step ? 0.5 : 1, transition: "all 0.4s" }} />)}
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "6px 22px 20px" }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(11), fontWeight: 600, color: T.gold, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>{s.phaseNum} · {s.phase}</div>
            <h2 style={{ fontFamily: "Cinzel, serif", fontSize: fz(22), fontWeight: 500, color: T.inkDark, margin: "0 0 14px" }}>{s.title}</h2>
            {s.instruction && <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(17), color: T.inkMid, lineHeight: 1.65, margin: "0 0 18px" }}>{s.instruction}</p>}
            {s.prayer && <Card><CardTitle>{s.prayerTitle}</CardTitle><div style={{ fontFamily: "EB Garamond, serif", fontSize: fz(16.5), color: T.inkDark, lineHeight: 1.7, fontStyle: "italic", whiteSpace: "pre-line" }}>{s.prayer}</div></Card>}
            {s.prompt && <Card style={{ marginBottom: 8 }}>
              <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(18), color: T.inkDark, fontStyle: "italic", margin: "0 0 12px" }}>{s.prompt}</p>
              <textarea value={reflections[step] || ""} onChange={e => setReflections(p => ({...p, [step]: e.target.value}))} placeholder="Write your reflection…" rows={4} style={{ width: "100%", padding: 12, fontFamily: "EB Garamond, serif", fontSize: fz(16), lineHeight: 1.6, color: T.inkDark, background: T.parchment, border: "1px solid rgba(212,168,67,0.2)", borderRadius: 8, resize: "vertical", boxSizing: "border-box" }} />
            </Card>}
            {s.saint && <div style={{ marginTop: 16 }}><SaintQuote name={s.saint.name} quote={s.saint.quote} source={s.saint.source} isExact={true} /></div>}
          </div>
          <div style={{ padding: "10px 22px 18px", borderTop: "1px solid rgba(212,168,67,0.12)", display: "flex", gap: 10 }}>
            {step > 0 && <div style={{ flex: 1 }}><GhostBtn onClick={() => setStep(step - 1)}>‹ Back</GhostBtn></div>}
            {step < EXAMEN_STEPS.length - 1 ? <div style={{ flex: 1 }}><CrimsonBtn onClick={() => setStep(step + 1)}>{step === 0 ? "Begin ›" : "Continue ›"}</CrimsonBtn></div> : <div style={{ flex: 1 }}><NavyBtn onClick={() => setView("summary")}>Finish Examen</NavyBtn></div>}
          </div>
        </div>
      )}
      {view === "summary" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 22px" }}>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: "50%", background: T.goldFaint, marginBottom: 10 }}><span style={{ fontSize: fz(24) }}>✓</span></div>
            <h2 style={{ fontFamily: "Cinzel, serif", fontSize: fz(22), fontWeight: 500, color: T.inkDark, margin: "0 0 4px" }}>Examen Complete</h2>
            <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(15), color: T.inkLight, fontStyle: "italic" }}>Go in peace. God holds your day in His hands.</p>
          </div>
          {Object.entries(reflections).filter(([_,v]) => v.trim()).map(([idx, txt]) => (
            <Card key={idx} style={{ marginBottom: 10 }}>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 600, color: T.gold, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>{EXAMEN_STEPS[parseInt(idx)]?.phase}</div>
              <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(15), color: T.inkDark, lineHeight: 1.55, margin: 0 }}>{txt}</p>
            </Card>
          ))}
          <GhostBtn onClick={() => setView("welcome")}>Return Home</GhostBtn>
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CONFESSION PREP
// ═══════════════════════════════════════════════════════════════════

function ConfessionTab() {
  const [view, setView] = useState("setup");
  const [cmdIdx, setCmdIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [notes, setNotes] = useState({});
  const [daysSince] = useState(32);
  const [absolved, setAbsolved] = useState(false);
  const [fade, setFade] = useState(true);
  const [lifeState, setLifeState] = useState(null); // null | "single" | "married" | "parent" | "consecrated"

  useEffect(() => { setFade(false); setTimeout(() => setFade(true), 50); }, [cmdIdx]);

  const LIFE_STATE_QUESTIONS = {
    child: { num: "✦", title: "A Child's Heart", cite: "\"Let the children come to me, for of such is the kingdom of heaven.\"", src: "Mt 19:14", questions: [
      { text: "I disobeyed or was rude to my parents, grandparents, or teachers.", grave: false },
      { text: "I was mean, unkind, or said hurtful things to a brother, sister, or friend.", grave: false },
      { text: "I told a lie, even a small one.", grave: false },
      { text: "I took something that wasn't mine, or didn't return something I borrowed.", grave: false },
      { text: "I hit, kicked, or hurt someone on purpose.", grave: false },
      { text: "I was selfish and didn't want to share or help.", grave: false },
      { text: "I missed Mass on Sunday without a good reason.", grave: false },
      { text: "I used God's name as a bad word or made fun of holy things.", grave: false },
      { text: "I watched, played, or looked at things I knew were wrong.", grave: false },
      { text: "I forgot to say my morning or night prayers for a long time.", grave: false },
    ]},
    single: { num: "✦", title: "State in Life — Single", cite: "\"It is good for a man not to touch a woman.\"", src: "1 Cor 7:1", questions: [
      { text: "I failed to guard my chastity in thought, word, or deed.", grave: true },
      { text: "I wasted time in idleness or worldly amusements rather than growing in virtue.", grave: false },
      { text: "I was uncharitable or unkind to those entrusted to my care.", grave: false },
      { text: "I failed to use my freedom as a single person for works of charity and prayer.", grave: false },
    ]},
    married: { num: "✦", title: "State in Life — Married", cite: "\"What God hath joined together, let no man put asunder.\"", src: "Mt 19:6", questions: [
      { text: "I was unfaithful in thought or deed to my spouse.", grave: true },
      { text: "I used contraception or deliberately rendered the conjugal act sterile.", grave: true },
      { text: "I was unkind, impatient, or uncharitable toward my spouse.", grave: false },
      { text: "I neglected prayer in common or the spiritual life of my marriage.", grave: false },
      { text: "I failed to provide financially or emotionally for my household.", grave: false },
    ]},
    parent: { num: "✦", title: "State in Life — Parent", cite: "\"Train up a child in the way he should go.\"", src: "Prov 22:6", questions: [
      { text: "I was unfaithful in thought or deed to my spouse.", grave: true },
      { text: "I used contraception or deliberately rendered the conjugal act sterile.", grave: true },
      { text: "I failed to teach my children the Faith, prayers, and commandments.", grave: true },
      { text: "I gave bad example to my children by my words, actions, or neglect of religion.", grave: false },
      { text: "I was harsh, impatient, or unjust in my discipline of my children.", grave: false },
      { text: "I neglected the physical, emotional, or spiritual needs of my children.", grave: false },
    ]},
    consecrated: { num: "✦", title: "State in Life — Consecrated", cite: "\"He that can take, let him take it.\"", src: "Mt 19:12", questions: [
      { text: "I failed in obedience to my superiors or my rule of life.", grave: true },
      { text: "I violated or was careless in my vow or promise of chastity.", grave: true },
      { text: "I was attached to or used material things contrary to my vow or spirit of poverty.", grave: false },
      { text: "I neglected the Divine Office, mental prayer, or the prescribed spiritual exercises.", grave: false },
      { text: "I gave bad example to those entrusted to my care or to the faithful generally.", grave: false },
    ]},
  };

  const examSteps = lifeState === "child"
    ? [LIFE_STATE_QUESTIONS["child"]]
    : lifeState
      ? [...COMMANDMENTS, LIFE_STATE_QUESTIONS[lifeState]]
      : COMMANDMENTS;

  const cmd = examSteps[cmdIdx];
  const timeSince = daysSince < 7 ? `${daysSince} days` : daysSince < 30 ? `${Math.round(daysSince/7)} weeks` : `${Math.round(daysSince/30)} months`;

  const mortalSins = [], venialSins = [];
  examSteps.forEach((c, ci) => c.questions.forEach((q, qi) => {
    const k = `${ci}-${qi}`;
    const label = ci < COMMANDMENTS.length ? `${c.num} Commandment` : c.title;
    if (answers[k] === "mortal") mortalSins.push({ text: q.text, cmd: label, note: notes[k] });
    if (answers[k] === "venial") venialSins.push({ text: q.text, cmd: label, note: notes[k] });
  }));

  const title = view === "exam" ? "Examination" : view === "review" ? "Your Examination" : view === "confess" ? "In the Confessional" : "Confession";

  return (
    <>
      <TopBar title={title} showBack={view !== "setup"} onBack={() => {
        if (view === "exam" && cmdIdx > 0) setCmdIdx(cmdIdx - 1);
        else if (view === "exam") setView("setup");
        else if (view === "review") { setView("exam"); setCmdIdx(examSteps.length - 1); }
        else if (view === "confess") setView("review");
        else setView("setup");
      }} />

      {view === "setup" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px" }}>
          <Card style={{ marginBottom: 16 }}>
            <CardTitle>Opening Prayer</CardTitle>
            {lifeState === "child"
              ? <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(16), fontStyle: "italic", color: T.inkDark, lineHeight: 1.6, margin: 0 }}>"Dear Holy Spirit, please help me to remember my sins and to be sorry for them. Help me to make a good confession. Amen."</p>
              : <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(16), fontStyle: "italic", color: T.inkDark, lineHeight: 1.6, margin: 0 }}>"Come, Holy Spirit, enlighten my heart to see what is sin in my life, give me the grace of true sorrow, and help me to resolve to amend my life. Amen."</p>
            }
          </Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div><div style={{ fontFamily: "Cinzel, serif", fontSize: fz(11), fontWeight: 600, color: T.inkLight, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 2 }}>Last Confession</div><div style={{ fontFamily: "Cinzel, serif", fontSize: fz(20), fontWeight: 600, color: T.navyText }}>{daysSince} <span style={{ fontSize: fz(13), fontWeight: 400, color: T.inkLight }}>days ago</span></div></div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(11), fontWeight: 600, color: T.inkLight, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Your State in Life</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { id: "child", icon: "🌟", label: "Child", sub: "Under 14" },
                { id: "single", icon: "🙏", label: "Single", sub: "Unmarried adult" },
                { id: "married", icon: "💍", label: "Married", sub: "Spouse, no children" },
                { id: "parent", icon: "👨‍👩‍👧", label: "Parent", sub: "Raising children" },
                { id: "consecrated", icon: "✝", label: "Consecrated", sub: "Religious or clergy" },
              ].map(ls => (
                <button key={ls.id} onClick={() => setLifeState(lifeState === ls.id ? null : ls.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "12px 8px", background: lifeState === ls.id ? T.goldFaint : T.warmWhite, border: `1.5px solid ${lifeState === ls.id ? T.gold : T.cardBorder}`, borderRadius: 10, cursor: "pointer" }}>
                  <span style={{ fontSize: fz(20) }}>{ls.icon}</span>
                  <span style={{ fontFamily: "Cinzel, serif", fontSize: fz(11), fontWeight: 600, color: lifeState === ls.id ? T.gold : T.navyText, letterSpacing: "0.04em" }}>{ls.label}</span>
                  <span style={{ fontFamily: "EB Garamond, serif", fontSize: fz(12), color: T.inkLight }}>{ls.sub}</span>
                </button>
              ))}
            </div>
            {lifeState && (
              <div style={{ marginTop: 10, padding: "8px 12px", background: T.goldFaint, borderRadius: 8, border: `1px solid rgba(212,168,67,0.2)` }}>
                <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(13), color: T.inkMid, margin: 0, lineHeight: 1.5 }}>
                  {lifeState === "child" && "A gentle examination written just for children — simple questions about kindness, honesty, obedience, and love of God. With a child's Act of Contrition at the end."}
                  {lifeState === "married" && "The examination will include the duties of spouses: fidelity, conjugal love, openness to life, mutual respect, and the obligations of the married state."}
                  {lifeState === "parent" && "The examination will include the duties of spouses and parents: raising children in the Faith, example, discipline, care, and transmission of the faith."}
                  {lifeState === "consecrated" && "The examination will include the vows or promises of your state: obedience, chastity, poverty, prayer, and fidelity to your rule of life."}
                </p>
              </div>
            )}
          </div>
          <CrimsonBtn onClick={() => { setCmdIdx(0); setAnswers({}); setNotes({}); setView("exam"); }} style={{ padding: "20px 0", fontSize: fz(16) }}>Begin Examination</CrimsonBtn>
          <div style={{ marginTop: 16, padding: "10px 12px", background: T.subtleBg, borderRadius: 8, display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span style={{ fontSize: fz(14), flexShrink: 0 }}>🔒</span>
            <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(13), fontStyle: "italic", color: T.inkLight, margin: 0, lineHeight: 1.5 }}>Your examination is never stored, sent, or logged. Everything stays in your device's memory and disappears when you leave this screen. Only you and God see your answers.</p>
          </div>
        </div>
      )}

      {view === "exam" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", opacity: fade ? 1 : 0, transform: fade ? "translateY(0)" : "translateY(10px)", transition: "all 0.4s" }}>
          <div style={{ padding: "10px 20px 4px", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 600, color: T.inkLight, letterSpacing: "0.06em", textTransform: "uppercase" }}>{cmdIdx < COMMANDMENTS.length ? "Ten Commandments" : "State in Life"}</span>
            <span style={{ fontFamily: "Cinzel, serif", fontSize: fz(12), fontWeight: 600, color: T.navyText }}>{cmdIdx + 1} / {examSteps.length}</span>
          </div>
          <div style={{ padding: "0 20px 6px" }}><div style={{ height: 3, borderRadius: 2, background: "rgba(212,168,67,0.15)" }}><div style={{ height: "100%", borderRadius: 2, background: `linear-gradient(90deg, ${T.crimson}, ${T.gold})`, width: `${((cmdIdx+1)/examSteps.length)*100}%`, transition: "width 0.5s" }} /></div></div>
          <div style={{ flex: 1, overflowY: "auto", padding: "6px 20px 16px" }}>
            <h2 style={{ fontFamily: "Cinzel, serif", fontSize: fz(20), fontWeight: 500, color: T.inkDark, margin: "0 0 3px" }}>{cmd.num} · {cmd.title}</h2>
            <div style={{ fontFamily: "EB Garamond, serif", fontSize: fz(15), fontStyle: "italic", color: T.gold, lineHeight: 1.5, marginBottom: 2 }}>{cmd.cite}</div>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 600, color: T.inkLight, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 14 }}>{cmd.src}</div>
            <div style={{ height: 1, background: "rgba(212,168,67,0.2)", marginBottom: 14 }} />
            {cmd.questions.map((q, qi) => {
              const k = `${cmdIdx}-${qi}`, a = answers[k];
              return (
                <div key={k} style={{ background: T.warmWhite, borderRadius: 12, border: `1px solid ${a === "mortal" ? "rgba(122,28,28,0.2)" : "rgba(212,168,67,0.15)"}`, padding: "14px 14px 12px", marginBottom: 10 }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 9px", marginBottom: 7, borderRadius: 12, background: q.grave ? "rgba(122,28,28,0.06)" : "rgba(212,168,67,0.08)", border: `1px solid ${q.grave ? "rgba(122,28,28,0.12)" : "rgba(212,168,67,0.18)"}` }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: q.grave ? T.crimson : T.gold }} />
                    <span style={{ fontFamily: "Cinzel, serif", fontSize: fz(9.5), fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: q.grave ? T.crimson : T.gold }}>{q.grave ? "Grave matter" : "Venial matter"}</span>
                  </div>
                  <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(16.5), color: T.inkDark, lineHeight: 1.55, margin: "0 0 10px" }}>{q.text}</p>
                  <div style={{ display: "flex", gap: 7 }}>
                    {q.grave ? (<>
                      <button onClick={() => setAnswers(p => p[k]==="mortal" ? (delete p[k], {...p}) : {...p,[k]:"mortal"})} style={{ flex: 1, padding: "14px 0", fontFamily: "Cinzel, serif", fontSize: fz(14), fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: a==="mortal" ? T.crimson : T.inkLight, background: a==="mortal" ? "rgba(122,28,28,0.08)" : "transparent", border: `1.5px solid ${a==="mortal" ? T.crimson : "rgba(138,126,108,0.15)"}`, borderRadius: 10, cursor: "pointer" }}>Mortal</button>
                      <button onClick={() => setAnswers(p => p[k]==="venial" ? (delete p[k], {...p}) : {...p,[k]:"venial"})} style={{ flex: 1, padding: "14px 0", fontFamily: "Cinzel, serif", fontSize: fz(14), fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: a==="venial" ? T.gold : T.inkLight, background: a==="venial" ? "rgba(212,168,67,0.1)" : "transparent", border: `1.5px solid ${a==="venial" ? T.gold : "rgba(138,126,108,0.15)"}`, borderRadius: 10, cursor: "pointer" }}>Venial</button>
                    </>) : (
                      <button onClick={() => setAnswers(p => p[k]==="venial" ? (delete p[k], {...p}) : {...p,[k]:"venial"})} style={{ flex: 1, padding: "14px 0", fontFamily: "Cinzel, serif", fontSize: fz(14), fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: a==="venial" ? T.gold : T.inkLight, background: a==="venial" ? "rgba(212,168,67,0.1)" : "transparent", border: `1.5px solid ${a==="venial" ? T.gold : "rgba(138,126,108,0.15)"}`, borderRadius: 10, cursor: "pointer" }}>Yes</button>
                    )}
                    <button onClick={() => setAnswers(p => p[k]==="not" ? (delete p[k], {...p}) : {...p,[k]:"not"})} style={{ flex: 1, padding: "14px 0", fontFamily: "Cinzel, serif", fontSize: fz(14), fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: a==="not" ? T.inkMid : T.inkLight, background: a==="not" ? "rgba(26,39,68,0.05)" : "transparent", border: `1.5px solid ${a==="not" ? "rgba(138,126,108,0.3)" : "rgba(138,126,108,0.15)"}`, borderRadius: 10, cursor: "pointer" }}>Not I</button>
                  </div>
                  {a === "mortal" && q.grave && <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "7px 9px", background: "rgba(122,28,28,0.05)", borderRadius: 6, marginTop: 8 }}><span style={{ fontSize: fz(13) }}>⚠️</span><span style={{ fontFamily: "EB Garamond, serif", fontSize: fz(13), color: T.crimson, fontWeight: 500 }}>Must be confessed specifically</span></div>}
                </div>
              );
            })}
          </div>
          <div style={{ padding: "16px 20px 26px", borderTop: "1px solid rgba(212,168,67,0.12)", display: "flex", gap: 10 }}>
            {cmdIdx > 0 && <button onClick={() => setCmdIdx(cmdIdx - 1)} style={{ flex: 1, padding: "20px 0", fontFamily: "Cinzel, serif", fontSize: fz(16), fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: T.navyText, background: T.warmWhite, border: `1.5px solid rgba(26,39,68,0.2)`, borderRadius: 10, cursor: "pointer" }}>‹ Back</button>}
            <button onClick={() => { if (cmdIdx < examSteps.length - 1) setCmdIdx(cmdIdx + 1); else setView("review"); }} style={{ flex: 1, padding: "20px 0", fontFamily: "Cinzel, serif", fontSize: fz(16), fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: T.warmWhite, background: `linear-gradient(135deg, ${T.crimson}, ${T.crimsonLight})`, border: "none", borderRadius: 10, cursor: "pointer", boxShadow: `0 3px 12px ${T.shadowCrimson}` }}>{cmdIdx < examSteps.length - 1 ? "Next ›" : "Review ›"}</button>
          </div>
        </div>
      )}

      {view === "review" && (
        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 14, padding: "22px 20px 6px" }}>
            {[{ v: mortalSins.length, l: "Mortal", c: T.crimson }, { v: venialSins.length, l: "Venial", c: T.gold }, { v: daysSince, l: "Days Since", c: T.navy }].map((s2,i) => (
              <div key={i} style={{ textAlign: "center", padding: "10px 16px", background: T.warmWhite, borderRadius: 10, border: `1px solid ${T.cardBorder}`, flex: 1 }}>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(24), fontWeight: 600, color: s2.c }}>{s2.v}</div>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 600, color: T.inkLight, letterSpacing: "0.05em", textTransform: "uppercase" }}>{s2.l}</div>
              </div>
            ))}
          </div>
          {mortalSins.length > 0 && <div style={{ padding: "14px 20px 0" }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(12), fontWeight: 700, color: T.crimson, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>Mortal Sins</div>
            {mortalSins.map((s2,i) => <div key={i} style={{ borderLeft: `3px solid ${T.crimson}`, paddingLeft: 14, background: T.warmWhite, padding: "10px 14px 10px 16px", borderRadius: "0 10px 10px 0", marginBottom: 8 }}><p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(15), color: T.inkDark, lineHeight: 1.45, margin: "0 0 2px" }}>{s2.text}</p><div style={{ fontFamily: "EB Garamond, serif", fontSize: fz(13), color: T.inkLight }}>{s2.cmd}{s2.note ? ` · ${s2.note}` : ""}</div></div>)}
          </div>}
          {venialSins.length > 0 && <div style={{ padding: "12px 20px 0" }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(12), fontWeight: 700, color: T.gold, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>Venial Sins</div>
            {venialSins.map((s2,i) => <div key={i} style={{ borderLeft: `3px solid ${T.gold}`, paddingLeft: 14, background: T.warmWhite, padding: "8px 14px 8px 16px", borderRadius: "0 10px 10px 0", marginBottom: 6 }}><p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(15), color: T.inkDark, lineHeight: 1.45, margin: 0 }}>{s2.text}</p></div>)}
          </div>}
          {mortalSins.length > 0 && <div style={{ margin: "12px 20px 0", padding: "10px 14px", background: "rgba(212,168,67,0.08)", border: `1px solid ${T.cardBorderStrong}`, borderRadius: 10, display: "flex", gap: 8, alignItems: "center" }}><span style={{ fontSize: fz(14) }}>⚠️</span><span style={{ fontFamily: "EB Garamond, serif", fontSize: fz(14), color: T.inkDark }}>{mortalSins.length} mortal sin{mortalSins.length > 1 ? "s" : ""} — a priest's absolution is essential</span></div>}
          <div style={{ padding: "18px 20px 0" }}><CrimsonBtn onClick={() => { setAbsolved(false); setView("confess"); }} style={{ padding: "20px 0", fontSize: fz(16) }}>Go to Confession ›</CrimsonBtn></div>
        </div>
      )}

      {view === "confess" && !absolved && (
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 30px" }}>
          <Card style={{ marginBottom: 16 }}>
            <CardTitle>When the Priest Is Ready</CardTitle>
            <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(15), fontStyle: "italic", color: T.inkMid, margin: "0 0 10px" }}>{lifeState === "child" ? "Make the Sign of the Cross, then say:" : "Make the Sign of the Cross, then say:"}</p>
            <div style={{ fontFamily: "EB Garamond, serif", fontSize: fz(17), color: T.inkDark, lineHeight: 1.7, padding: "12px 14px", background: T.parchment, borderRadius: 8, borderLeft: `3px solid ${T.navyText}` }}>
              {lifeState === "child"
                ? <span>"Bless me Father, for I have sinned. This is my <strong style={{ color: T.crimson }}>first confession</strong> <em style={{ color: T.inkLight, fontSize: fz(14) }}>(or: It has been {timeSince} since my last confession)</em>. These are my sins:"</span>
                : <span>"Bless me Father, for I have sinned. It has been <strong style={{ color: T.crimson }}>{timeSince}</strong> since my last confession. These are my sins:"</span>
              }
            </div>
          </Card>
          {mortalSins.length > 0 && <div style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(12), fontWeight: 700, color: T.crimson, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>Mortal Sins — Confess Each</div>
            {mortalSins.map((s2,i) => <div key={i} style={{ borderLeft: `3px solid ${T.crimson}`, background: T.warmWhite, padding: "10px 14px 10px 16px", borderRadius: "0 10px 10px 0", marginBottom: 6 }}><p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(15.5), color: T.inkDark, margin: 0 }}>{s2.text}</p></div>)}
          </div>}
          {venialSins.length > 0 && <div style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(12), fontWeight: 700, color: T.gold, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>Venial Sins</div>
            {venialSins.map((s2,i) => <div key={i} style={{ borderLeft: `3px solid ${T.gold}`, background: T.warmWhite, padding: "8px 14px 8px 16px", borderRadius: "0 10px 10px 0", marginBottom: 6 }}><p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(15), color: T.inkDark, margin: 0 }}>{s2.text}</p></div>)}
          </div>}
          <Card style={{ borderLeft: `3px solid ${T.navyText}`, marginBottom: 16 }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 700, color: T.navyText, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>After Listing Your Sins</div>
            <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(17), fontStyle: "italic", color: T.inkDark, lineHeight: 1.6, margin: 0 }}>
              {lifeState === "child"
                ? "\"I am sorry for all my sins.\""
                : "\"For these and all the sins of my past life, I am truly sorry.\""
              }
            </p>
          </Card>
          <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(14), fontStyle: "italic", color: T.inkMid, textAlign: "center", marginBottom: 16 }}>
            {lifeState === "child"
              ? "The priest may give you a penance (like a prayer to say). Then he will ask for your Act of Contrition."
              : "The priest may offer counsel and assign a penance, then ask for your Act of Contrition."
            }
          </p>
          <Card style={{ marginBottom: 16 }}>
            <CardTitle>Act of Contrition</CardTitle>
            <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(16.5), fontStyle: "italic", color: T.inkDark, lineHeight: 1.65, margin: 0 }}>{ACT_OF_CONTRITION}</p>
          </Card>
          <NavyBtn onClick={() => setAbsolved(true)} style={{ padding: "20px 0", fontSize: fz(16) }}>Confession Complete ›</NavyBtn>
        </div>
      )}

      {view === "confess" && absolved && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: T.goldFaint, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, border: "1.5px solid rgba(212,168,67,0.2)" }}><span style={{ fontSize: fz(28) }}>✝</span></div>
          <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(18), fontStyle: "italic", color: T.inkMid, lineHeight: 1.6, marginBottom: 16 }}>"Go in peace, your sins are forgiven."</p>
          <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(16), color: T.inkDark, lineHeight: 1.6, marginBottom: 28, maxWidth: 300 }}>Accept and complete your penance. Make a firm purpose of amendment. Thank God for the gift of this sacrament.</p>
          <NavyBtn onClick={() => setView("setup")} style={{ width: "auto", padding: "20px 48px", fontSize: fz(16) }}>Return Home ›</NavyBtn>
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TRADITION BROWSER
// ═══════════════════════════════════════════════════════════════════

function TraditionTab() {
  const [view, setView] = useState("list");
  const [doctor, setDoctor] = useState(null);
  const [search, setSearch] = useState("");
  const [quoteIdx, setQuoteIdx] = useState(0);

  useEffect(() => { if (doctor) { const iv = setInterval(() => setQuoteIdx(p => (p + 1) % doctor.quotes.length), 8000); return () => clearInterval(iv); }}, [doctor]);

  const filtered = DOCTORS.filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.topics.some(t => t.toLowerCase().includes(search.toLowerCase())));
  const eras = ["Patristic","Medieval","Early Modern","Modern"];
  const grouped = {}; filtered.forEach(d => { if (!grouped[d.era]) grouped[d.era] = []; grouped[d.era].push(d); });

  const title = view === "profile" && doctor ? "The Doctors" : "The Doctors";

  return (
    <>
      <TopBar title={title} showBack={view !== "list"} onBack={() => { setView("list"); setDoctor(null); setQuoteIdx(0); }} />
      {view === "list" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px" }}>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: "50%", background: T.goldFaint, border: "1.5px solid rgba(212,168,67,0.2)", marginBottom: 8 }}><span style={{ fontSize: fz(24) }}>🏛</span></div>
            <h2 style={{ fontFamily: "Cinzel, serif", fontSize: fz(22), fontWeight: 500, color: T.inkDark, margin: "0 0 3px" }}>The Doctors</h2>
            <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(15), fontStyle: "italic", color: T.inkLight, margin: 0 }}>Guides of the Catholic moral tradition</p>
          </div>
          <div style={{ position: "relative", marginBottom: 16 }}>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search the Doctors…" style={{ width: "100%", padding: "11px 14px 11px 36px", fontFamily: "EB Garamond, serif", fontSize: fz(16), color: T.inkDark, background: T.warmWhite, border: `1px solid ${T.cardBorderStrong}`, borderRadius: 10, boxSizing: "border-box" }} />
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: fz(14), pointerEvents: "none" }}>🔍</span>
          </div>
          {eras.filter(e => grouped[e]).map(era => (
            <div key={era} style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(11), fontWeight: 700, color: T.navyText, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{era} Era</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {grouped[era].map(d => (
                  <button key={d.id} onClick={() => { setDoctor(d); setQuoteIdx(0); setView("profile"); }} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "14px", background: T.warmWhite, border: "1px solid rgba(212,168,67,0.2)", borderRadius: 12, cursor: "pointer", textAlign: "left" }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: T.goldFaint, display: "flex", alignItems: "center", justifyContent: "center", fontSize: fz(20), flexShrink: 0, border: "1px solid rgba(212,168,67,0.2)" }}>{d.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(13.5), fontWeight: 600, color: T.navyText }}>{d.name}</div>
                      <div style={{ fontFamily: "EB Garamond, serif", fontSize: fz(13), color: T.inkLight }}>{d.dates} · {d.order}</div>
                      <div style={{ fontFamily: "EB Garamond, serif", fontSize: fz(13), fontStyle: "italic", color: T.gold }}>{d.titleEn}</div>
                    </div>
                    <span style={{ color: T.gold, fontSize: fz(18) }}>›</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {view === "profile" && doctor && (
        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 24 }}>
          <div style={{ textAlign: "center", padding: "22px 22px 0" }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 68, height: 68, borderRadius: "50%", background: T.goldFaint, border: "1.5px solid rgba(212,168,67,0.2)", marginBottom: 12 }}><span style={{ fontSize: fz(30) }}>{doctor.icon}</span></div>
            <h2 style={{ fontFamily: "Cinzel, serif", fontSize: fz(24), fontWeight: 500, color: T.inkDark, margin: "0 0 3px" }}>{doctor.name}</h2>
            <div style={{ fontFamily: "EB Garamond, serif", fontSize: fz(15), color: T.inkLight }}>{doctor.dates} · {doctor.order}</div>
            <div style={{ fontFamily: "EB Garamond, serif", fontSize: fz(15), fontStyle: "italic", color: T.gold, marginTop: 2 }}>"{doctor.titleEn}"</div>
          </div>
          <div style={{ padding: "18px 22px 0" }}>
            <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(17), color: T.inkDark, lineHeight: 1.65, margin: 0 }}>{doctor.bio}</p>
          </div>
          <div style={{ margin: "18px 22px 0" }}>
            <SaintQuote name={doctor.name} quote={doctor.quotes[quoteIdx % doctor.quotes.length].text} source={doctor.quotes[quoteIdx % doctor.quotes.length].source} isExact={true} />
            <div style={{ display: "flex", gap: 5, marginTop: 8, paddingLeft: 16 }}>
              {doctor.quotes.map((_, i) => <button key={i} onClick={() => setQuoteIdx(i)} style={{ width: i === quoteIdx % doctor.quotes.length ? 18 : 6, height: 6, borderRadius: 3, background: i === quoteIdx % doctor.quotes.length ? T.gold : "rgba(212,168,67,0.3)", border: "none", cursor: "pointer", padding: 0, transition: "all 0.3s" }} />)}
            </div>
          </div>
          <div style={{ padding: "20px 22px 0" }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(12), fontWeight: 700, color: T.gold, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>Key Topics</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {doctor.topics.map(t => <span key={t} style={{ padding: "5px 12px", fontFamily: "EB Garamond, serif", fontSize: fz(14), color: T.inkMid, background: T.warmWhite, border: `1px solid ${T.cardBorderStrong}`, borderRadius: 20 }}>{t}</span>)}
            </div>
          </div>
          <div style={{ padding: "20px 22px 0" }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(12), fontWeight: 700, color: T.gold, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>Key Works</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {doctor.works.map((w,i) => {
                const work = typeof w === "string" ? { title: w, url: null } : w;
                return work.url ? (
                  <a key={i} href={work.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: T.warmWhite, border: "1px solid rgba(212,168,67,0.2)", borderRadius: 10, textDecoration: "none" }}>
                    <span style={{ fontSize: fz(15), color: T.gold }}>📖</span>
                    <span style={{ fontFamily: "EB Garamond, serif", fontSize: fz(15.5), fontStyle: "italic", color: T.inkDark, flex: 1 }}>{work.title}</span>
                    <span style={{ fontFamily: "Cinzel, serif", fontSize: 10, fontWeight: 600, color: T.gold, letterSpacing: "0.04em", padding: "2px 8px", background: T.goldFaint, border: `1px solid rgba(212,168,67,0.25)`, borderRadius: 12 }}>↗ Read</span>
                  </a>
                ) : (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: T.warmWhite, border: "1px solid rgba(212,168,67,0.2)", borderRadius: 10 }}>
                    <span style={{ fontSize: fz(15), color: T.gold }}>📖</span>
                    <span style={{ fontFamily: "EB Garamond, serif", fontSize: fz(15.5), fontStyle: "italic", color: T.inkDark, flex: 1 }}>{work.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STATIONS OF THE CROSS — TAB
// ═══════════════════════════════════════════════════════════════════
function StationIcon({ idx }) {
  const c = ST_COLORS[idx] || ["#654321","#8B6914"];
  const [imgError, setImgError] = useState(false);
  const imgUrl = ST_IMGS[idx];

  return (
    <div style={{ width: "100%", borderRadius: 10, marginBottom: 14, overflow: "hidden", position: "relative", background: `linear-gradient(135deg, ${c[0]}, ${c[1]})` }}>
      {imgUrl && !imgError ? (
        <>
          <img src={imgUrl} alt={ST_TITLES[idx]} onError={() => setImgError(true)} style={{ width: "100%", height: "auto", display: "block", minHeight: 120, objectFit: "cover" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px 10px 6px", background: "linear-gradient(transparent, rgba(0,0,0,0.6))", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <span style={{ fontFamily: "Cinzel, serif", fontSize: fz(9), color: "rgba(255,255,255,0.7)", letterSpacing: "0.06em" }}>Station {["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV"][idx]}</span>
            <span style={{ fontFamily: "EB Garamond, serif", fontSize: fz(8), color: "rgba(255,255,255,0.5)", fontStyle: "italic" }}>{ST_CREDITS[idx]}</span>
          </div>
        </>
      ) : (
        <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(212,168,67,0.08) 0%, transparent 70%)" }} />
          <svg viewBox="0 0 100 100" width="90" height="90" style={{ opacity: 0.85 }} dangerouslySetInnerHTML={{ __html: ST_SYMBOLS[idx] || ST_SYMBOLS[0] }} />
          <div style={{ position: "absolute", bottom: 6, right: 10, fontFamily: "Cinzel, serif", fontSize: fz(9), color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em" }}>Station {["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV"][idx]}</div>
        </div>
      )}
    </div>
  );
}

function StationsTab({ goHome }) {
  const [scr, setScr] = useState("select");
  const [ver, setVer] = useState(null);
  const [idx, setIdx] = useState(0);
  const [fsz, setFsz] = useState(1);
  const [fade, setFade] = useState(true);
  const topRef = useRef(null);
  const R = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV"];
  const SZ = [{ l:"S",b:15*fontScale,m:15.5*fontScale,p:15*fontScale },{ l:"M",b:17*fontScale,m:17.5*fontScale,p:17*fontScale },{ l:"L",b:20*fontScale,m:20.5*fontScale,p:20*fontScale },{ l:"XL",b:23*fontScale,m:23.5*fontScale,p:23*fontScale }];
  const fs = SZ[fsz];

  const scrollUp = useCallback(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    if (topRef.current) { topRef.current.scrollIntoView({ block: "start" }); }
    if (topRef.current) { let el = topRef.current.parentElement; while (el) { el.scrollTop = 0; el = el.parentElement; } }
  }, []);

  useEffect(() => {
    setFade(false);
    scrollUp();
    const t = setTimeout(() => setFade(true), 60);
    return () => clearTimeout(t);
  }, [idx, scr, scrollUp]);

  const navNext = () => { setIdx(idx + 1); };
  const navBack = () => { if (idx > 0) setIdx(idx - 1); else setScr("open"); };
  const navFinish = () => { setScr("close"); };

  const getTitle = () => {
    if (scr === "open") return "Preparatory Prayer";
    if (scr === "sta") return "Station " + R[idx];
    if (scr === "close") return "Via Crucis Complete";
    return "Stations of the Cross";
  };

  const handleBack = () => {
    if (scr === "sta" && idx > 0) setIdx(idx - 1);
    else if (scr === "sta") setScr("open");
    else if (scr === "open") { setScr("select"); setVer(null); }
    else if (scr === "close") { setScr("select"); setVer(null); }
    else goHome();
  };

  const v = ver ? ST_VER[ver] : null;
  const st = v && scr === "sta" ? v.st[idx] : null;

  return (
    <>
      <div ref={topRef} style={{ height: 0, overflow: "hidden" }} />
      <TopBar title={getTitle()} showBack onBack={handleBack}
        rightAction={scr === "sta" ? <button onClick={() => { setScr("select"); setVer(null); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: fz(13), color: T.inkLight, width: 28, padding: 0 }}>✕</button> : undefined}
      />

      {scr !== "select" && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "6px 22px 4px", gap: 4, flexShrink: 0 }}>
          <span style={{ fontFamily: "Cinzel, serif", fontSize: fz(9), fontWeight: 600, color: T.inkLight, letterSpacing: "0.06em", textTransform: "uppercase", marginRight: 4 }}>Text</span>
          {SZ.map((s, i) => (
            <button key={i} onClick={() => setFsz(i)} style={{ padding: "3px 8px", fontFamily: "Cinzel, serif", fontSize: i <= 1 ? 11 : 13, fontWeight: 600, color: fsz === i ? T.warmWhite : T.inkLight, background: fsz === i ? T.navy : "transparent", border: `1px solid ${fsz === i ? T.navy : "rgba(138,126,108,0.2)"}`, borderRadius: 6, cursor: "pointer", lineHeight: 1.3, minWidth: 28, textAlign: "center" }}>{s.l}</button>
          ))}
        </div>
      )}

      {/* VERSION SELECT */}
      {scr === "select" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "22px" }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 68, height: 68, borderRadius: "50%", background: T.goldFaint, border: "1.5px solid rgba(212,168,67,0.2)", marginBottom: 12 }}><span style={{ fontSize: fz(30) }}>✝</span></div>
            <h2 style={{ fontFamily: "Cinzel, serif", fontSize: fz(24), fontWeight: 500, color: T.inkDark, margin: "0 0 4px" }}>Stations of the Cross</h2>
            <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(15), fontStyle: "italic", color: T.gold, margin: 0 }}>Via Crucis</p>
          </div>
          <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(12), fontWeight: 600, color: T.inkDark, marginBottom: 14 }}>Choose Your Way</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.values(ST_VER).map(vi => (
              <button key={vi.id} onClick={() => { setVer(vi.id); setScr("open"); }} style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", padding: "18px 16px", background: T.warmWhite, border: `1px solid ${T.cardBorderStrong}`, borderRadius: 12, cursor: "pointer", textAlign: "left" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: T.goldFaint, display: "flex", alignItems: "center", justifyContent: "center", fontSize: fz(20), flexShrink: 0, border: "1.5px solid rgba(212,168,67,0.2)" }}>{vi.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(14), fontWeight: 600, color: T.navyText, marginBottom: 2 }}>{vi.label}</div>
                  <div style={{ fontFamily: "EB Garamond, serif", fontSize: fz(14), color: T.inkLight }}>{vi.desc}</div>
                </div>
                <span style={{ color: T.gold, fontSize: fz(18) }}>›</span>
              </button>
            ))}
          </div>
          <Card style={{ marginTop: 18 }}>
            <CardTitle color={T.navy}>Plenary Indulgence</CardTitle>
            <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(15), color: T.inkDark, lineHeight: 1.6, margin: 0 }}>The Way of the Cross carries a plenary indulgence under the usual conditions: sacramental confession, Eucharistic communion, prayer for the Pope's intentions, and freedom from attachment to sin.</p>
          </Card>
        </div>
      )}

      {/* OPENING PRAYER */}
      {scr === "open" && v && (
        <div style={{ flex: 1, overflowY: "auto", padding: "22px" }}>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(11), fontWeight: 600, color: T.gold, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>{v.label}</div>
            <h2 style={{ fontFamily: "Cinzel, serif", fontSize: fz(20), fontWeight: 500, color: T.inkDark, margin: "0 0 4px" }}>Preparatory Prayer</h2>
          </div>
          <Card style={{ borderLeft: `3px solid ${T.navyText}`, marginBottom: 20 }}>
            <p style={{ fontFamily: "EB Garamond, serif", fontSize: fs.p, fontStyle: "italic", color: T.inkDark, lineHeight: 1.7, margin: 0 }}>{v.op}</p>
          </Card>
          <CrimsonBtn onClick={() => { setIdx(0); setScr("sta"); }}>Begin · Station I ›</CrimsonBtn>
        </div>
      )}

      {/* STATION */}
      {scr === "sta" && v && st && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", opacity: fade ? 1 : 0, transition: "opacity 0.4s ease" }}>
          <div style={{ padding: "10px 22px 4px", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 600, color: T.inkLight, letterSpacing: "0.06em", textTransform: "uppercase" }}>{v.label}</span>
            <span style={{ fontFamily: "Cinzel, serif", fontSize: fz(12), fontWeight: 600, color: T.navyText }}>{R[idx]} / XIV</span>
          </div>
          <div style={{ padding: "0 22px 6px" }}>
            <div style={{ height: 3, borderRadius: 2, background: "rgba(212,168,67,0.15)" }}>
              <div style={{ height: "100%", borderRadius: 2, background: `linear-gradient(90deg, ${T.crimson}, ${T.gold})`, width: ((idx + 1) / 14 * 100) + "%", transition: "width 0.5s" }} />
            </div>
          </div>
          <div key={idx} style={{ flex: 1, overflowY: "auto", padding: "6px 22px 22px" }}>
            <div style={{ textAlign: "center", marginBottom: 12 }}>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(13), fontWeight: 700, color: T.gold, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Station {R[idx]}</div>
              <h2 style={{ fontFamily: "Cinzel, serif", fontSize: fz(19), fontWeight: 500, color: T.inkDark, margin: 0, lineHeight: 1.35 }}>{ST_TITLES[idx]}</h2>
            </div>
            <StationIcon idx={idx} />
            <Card style={{ marginBottom: 14, borderLeft: `3px solid ${T.crimson}` }}>
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 700, color: T.crimson, marginRight: 8 }}>V.</span>
                <span style={{ fontFamily: "EB Garamond, serif", fontSize: fs.b, fontStyle: "italic", color: T.inkDark }}>{ST_VERSICLE.v}</span>
              </div>
              <div>
                <span style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 700, color: T.crimson, marginRight: 8 }}>R.</span>
                <span style={{ fontFamily: "EB Garamond, serif", fontSize: fs.b, fontWeight: 600, color: T.inkDark }}>{ST_VERSICLE.r}</span>
              </div>
            </Card>
            {v.hasSc && st.s && (
              <Card style={{ marginBottom: 14, borderLeft: `3px solid ${T.navyText}`, background: "rgba(26,39,68,0.02)" }}>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 700, color: T.navyText, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Scripture · {st.sr}</div>
                <p style={{ fontFamily: "EB Garamond, serif", fontSize: fs.b - 1, fontStyle: "italic", color: T.inkDark, lineHeight: 1.65, margin: 0 }}>{st.s}</p>
              </Card>
            )}
            <div style={{ marginBottom: 14 }}>
              <CardTitle color={T.navy}>Meditation</CardTitle>
              <p style={{ fontFamily: "EB Garamond, serif", fontSize: fs.m, color: T.inkDark, lineHeight: 1.7, margin: 0 }}>{st.m}</p>
            </div>
            <div style={{ textAlign: "center", margin: "0 0 14px", padding: "10px 0" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "7px 18px", background: T.goldFaint, borderRadius: 20, border: `1px solid ${T.cardBorder}` }}>
                <span style={{ fontSize: fz(13) }}>🕯</span>
                <span style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 600, color: T.gold, letterSpacing: "0.08em", textTransform: "uppercase" }}>Pause in silence</span>
                <span style={{ fontSize: fz(13) }}>🕯</span>
              </div>
            </div>
            <Card style={{ borderLeft: `3px solid ${T.gold}`, marginBottom: 14 }}>
              <CardTitle color={T.gold}>Prayer</CardTitle>
              <p style={{ fontFamily: "EB Garamond, serif", fontSize: fs.p, fontStyle: "italic", color: T.inkDark, lineHeight: 1.7, margin: 0 }}>{st.p}</p>
            </Card>
            <div style={{ textAlign: "center", marginBottom: 10 }}>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 600, color: T.inkLight, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 5 }}>Then pray</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
                {["Our Father","Hail Mary","Glory Be"].map(x => <span key={x} style={{ fontFamily: "EB Garamond, serif", fontSize: fz(14), color: T.inkMid, fontStyle: "italic" }}>{x}</span>)}
              </div>
            </div>
            <div style={{ textAlign: "center", padding: "10px 14px", background: "rgba(122,28,28,0.03)", borderRadius: 8 }}>
              <div style={{ fontFamily: "EB Garamond, serif", fontSize: Math.max(13, fs.b - 3), fontStyle: "italic", color: T.inkMid, lineHeight: 1.6, whiteSpace: "pre-line" }}>{STABAT[idx]}</div>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(9), fontWeight: 600, color: T.inkLight, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 4 }}>Stabat Mater</div>
            </div>
          </div>
          <div style={{ padding: "10px 22px 18px", borderTop: "1px solid rgba(212,168,67,0.12)", display: "flex", gap: 10, flexShrink: 0 }}>
            {idx > 0 && <div style={{ flex: 1 }}><GhostBtn onClick={navBack}>‹ Back</GhostBtn></div>}
            {idx === 13
              ? <div style={{ flex: 1 }}><NavyBtn onClick={navFinish}>Closing Prayer ›</NavyBtn></div>
              : <div style={{ flex: 1 }}><CrimsonBtn onClick={navNext}>Station {R[idx + 1]} ›</CrimsonBtn></div>
            }
          </div>
        </div>
      )}

      {/* CLOSING */}
      {scr === "close" && v && (
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 22px 30px" }}>
          <div style={{ textAlign: "center", marginBottom: 22 }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: "50%", background: T.goldFaint, border: "1.5px solid rgba(212,168,67,0.2)", marginBottom: 12 }}><span style={{ fontSize: fz(28) }}>✝</span></div>
            <h2 style={{ fontFamily: "Cinzel, serif", fontSize: fz(22), fontWeight: 500, color: T.inkDark, margin: "0 0 4px" }}>Via Crucis Complete</h2>
            <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(15), fontStyle: "italic", color: T.gold, margin: 0 }}>{v.label}</p>
          </div>
          <Card style={{ borderLeft: `3px solid ${T.navyText}`, marginBottom: 18 }}>
            <CardTitle color={T.navy}>{v.clT}</CardTitle>
            <p style={{ fontFamily: "EB Garamond, serif", fontSize: fs.p, fontStyle: "italic", color: T.inkDark, lineHeight: 1.7, margin: 0 }}>{v.cl}</p>
          </Card>
          <Card style={{ borderLeft: `3px solid ${T.crimson}`, marginBottom: 18 }}>
            <CardTitle color={T.crimson}>Stabat Mater</CardTitle>
            <div style={{ fontFamily: "EB Garamond, serif", fontSize: fs.b, fontStyle: "italic", color: T.inkDark, lineHeight: 1.7, whiteSpace: "pre-line" }}>{"Stabat Mater dolorosa\njuxta Crucem lacrimosa,\ndum pendebat Filius.\n\nCujus animam gementem,\ncontristatam et dolentem\npertransivit gladius."}</div>
            <div style={{ fontFamily: "EB Garamond, serif", fontSize: fs.b - 3, color: T.inkLight, fontStyle: "italic", marginTop: 10 }}>The sorrowful Mother stood weeping beside the Cross where her Son was hanging.</div>
          </Card>
          {ver === "ratzinger" && (
            <div style={{ padding: "8px 14px", background: "rgba(26,39,68,0.03)", borderRadius: 8, border: "1px solid rgba(26,39,68,0.06)", marginBottom: 16 }}>
              <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(12), color: T.inkLight, margin: 0, fontStyle: "italic" }}>Meditations by Cardinal Joseph Ratzinger. Good Friday 2005, Colosseum, Rome. © Libreria Editrice Vaticana.</p>
            </div>
          )}
          <GhostBtn onClick={goHome}>Return Home</GhostBtn>
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ROSARY — TAB
// ═══════════════════════════════════════════════════════════════════
function RosaryTab({ goHome, dark, setDark, fszGlobal, setFszGlobal }) {
  const [scr, setScr] = useState("select"); // select | pray | complete
  const [mys, setMys] = useState(null); // joyful|sorrowful|glorious|luminous
  const [decade, setDecade] = useState(0); // 0-4
  const [step, setStep] = useState("opening"); // opening|announce|ourfather|hailmary|glory|fatima|closing
  const [bead, setBead] = useState(0); // bead counter for hail marys
  const [openStep, setOpenStep] = useState(0); // 0=creed, 1=OF, 2=HM×3, 3=GB
  const [fsz, setFsz] = useState(1);
  const topRef = useRef(null);

  const SZ = [{ l:"S",b:15*fontScale,m:15.5*fontScale,p:15*fontScale },{ l:"M",b:17*fontScale,m:17.5*fontScale,p:17*fontScale },{ l:"L",b:20*fontScale,m:20.5*fontScale,p:20*fontScale },{ l:"XL",b:23*fontScale,m:23.5*fontScale,p:23*fontScale }];
  const fs = SZ[fsz];

  const P = ROSARY_PRAYERS;
  const M = mys ? ROSARY_MYSTERIES[mys] : null;
  const mystery = M ? M.mysteries[decade] : null;

  const scrollUp = useCallback(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    if (topRef.current) {
      topRef.current.scrollIntoView({ block: "start" });
      let el = topRef.current.parentElement;
      while (el) { el.scrollTop = 0; el = el.parentElement; }
    }
  }, []);

  const advance = () => {
    scrollUp();
    if (step === "opening") {
      if (openStep === 2) {
        // Opening Hail Marys: count 3 beads
        if (bead < 3) { setBead(bead + 1); return; }
        setOpenStep(3); setBead(0); return;
      }
      if (openStep < 3) {
        const next = openStep + 1;
        setOpenStep(next);
        if (next === 2) setBead(1); // Start first opening HM bead
        return;
      }
      setStep("announce"); return;
    }
    if (step === "announce") { setStep("ourfather"); return; }
    if (step === "ourfather") { setStep("hailmary"); setBead(1); return; }
    if (step === "hailmary") {
      if (bead < 10) { setBead(bead + 1); return; }
      setStep("glory"); return;
    }
    if (step === "glory") { setStep("fatima"); return; }
    if (step === "fatima") {
      if (decade < 4) { setDecade(decade + 1); setStep("announce"); return; }
      setStep("closing"); return;
    }
    if (step === "closing") { setScr("complete"); return; }
  };

  const goBack = () => {
    scrollUp();
    if (step === "closing") { setStep("fatima"); setDecade(4); return; }
    if (step === "fatima") { setStep("glory"); return; }
    if (step === "glory") { setStep("hailmary"); setBead(10); return; }
    if (step === "hailmary") {
      if (bead > 1) { setBead(bead - 1); return; }
      setStep("ourfather"); return;
    }
    if (step === "ourfather") { setStep("announce"); return; }
    if (step === "announce") {
      if (decade > 0) { setDecade(decade - 1); setStep("fatima"); return; }
      setStep("opening"); setOpenStep(3); return;
    }
    if (step === "opening") {
      if (openStep === 2 && bead > 1) { setBead(bead - 1); return; }
      if (openStep > 0) { setOpenStep(openStep - 1); setBead(0); return; }
      setScr("select"); setMys(null); return;
    }
  };

  const handleBack = () => {
    if (scr === "complete") { setScr("select"); setMys(null); return; }
    if (scr === "pray") { goBack(); return; }
    goHome();
  };

  const getTotalProgress = () => {
    let p = 0;
    // Opening: 4 steps
    if (step === "opening") return (openStep + 1) / 34;
    p = 4;
    // Each decade: 5 steps (announce, OF, HM, glory, fatima) but HM counts as 10
    const stepsPerDecade = 14; // announce(1) + OF(1) + HM(10) + glory(1) + fatima(1)
    p += decade * stepsPerDecade;
    if (step === "announce") p += 0;
    else if (step === "ourfather") p += 1;
    else if (step === "hailmary") p += 1 + bead;
    else if (step === "glory") p += 12;
    else if (step === "fatima") p += 13;
    else if (step === "closing") p = 4 + 5 * stepsPerDecade;
    return p / (4 + 5 * stepsPerDecade + 1);
  };

  const getTitle = () => {
    if (scr === "select") return "The Holy Rosary";
    if (scr === "complete") return "Rosary Complete";
    if (step === "opening") return "Opening Prayers";
    if (step === "closing") return "Closing Prayers";
    return M ? M.mysteries[decade].title : "Rosary";
  };

  const getPrayerContent = () => {
    if (step === "opening") {
      if (openStep === 0) return { label: "Apostles' Creed", text: P.creed };
      if (openStep === 1) return { label: "Our Father", text: P.ourFather };
      if (openStep === 2) return { label: "Hail Mary", text: P.hailMary, beadOf: bead, beadTotal: 3, note: "For Faith, Hope, and Charity" };
      return { label: "Glory Be", text: P.gloryBe };
    }
    if (step === "announce") return { label: `${decade + 1}${["st","nd","rd","th","th"][decade]} Mystery`, text: mystery.scripture, ref: mystery.ref, title: mystery.title, fruit: mystery.fruit, isAnnounce: true, img: mystery.img, credit: mystery.credit };
    if (step === "ourfather") return { label: "Our Father", text: P.ourFather, img: mystery.img, credit: mystery.credit };
    if (step === "hailmary") return { label: "Hail Mary", text: P.hailMary, beadOf: bead, beadTotal: 10, img: mystery.img, credit: mystery.credit };
    if (step === "glory") return { label: "Glory Be", text: P.gloryBe, img: mystery.img, credit: mystery.credit };
    if (step === "fatima") return { label: "Fatima Prayer", text: P.fatima, img: mystery.img, credit: mystery.credit };
    if (step === "closing") return { label: "Hail, Holy Queen", text: P.hailHolyQueen + "\n\n" + P.closing };
    return { label: "", text: "" };
  };

  // Today's suggested mysteries
  const dayMysteries = () => {
    const d = new Date().getDay();
    if (d === 1 || d === 6) return "joyful";
    if (d === 2 || d === 5) return "sorrowful";
    if (d === 0 || d === 3) return "glorious";
    return "sorrowful"; // Thursday: traditionally Sorrowful
  };
  const suggested = dayMysteries();

  return (
    <>
      <div ref={topRef} style={{ height: 0, overflow: "hidden" }} />
      <TopBar title={getTitle()} showBack onBack={handleBack} rightAction={
        <button onClick={() => setDark && setDark(d => !d)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: fz(17), color: T.inkLight, width: 28, padding: 0, lineHeight: 1 }} title="Toggle dark mode">{dark ? "☀️" : "🌙"}</button>
      } />

      {scr !== "select" && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "6px 22px 4px", gap: 4, flexShrink: 0 }}>
          <span style={{ fontFamily: "Cinzel, serif", fontSize: fz(9), fontWeight: 600, color: T.inkLight, letterSpacing: "0.06em", textTransform: "uppercase", marginRight: 4 }}>Text</span>
          {SZ.map((s, i) => (
            <button key={i} onClick={() => setFsz(i)} style={{ padding: "3px 8px", fontFamily: "Cinzel, serif", fontSize: i <= 1 ? 11 : 13, fontWeight: 600, color: fsz === i ? T.warmWhite : T.inkLight, background: fsz === i ? T.navy : "transparent", border: `1px solid ${fsz === i ? T.navy : "rgba(138,126,108,0.2)"}`, borderRadius: 6, cursor: "pointer", lineHeight: 1.3, minWidth: 28, textAlign: "center" }}>{s.l}</button>
          ))}
        </div>
      )}
      {scr === "select" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "22px" }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 68, height: 68, borderRadius: "50%", background: T.goldFaint, border: `1.5px solid rgba(212,168,67,0.2)`, marginBottom: 12 }}>
              <svg viewBox="0 0 100 100" width="36" height="36"><circle cx="50" cy="28" r="12" fill="none" stroke={T.gold} strokeWidth="2.5"/><line x1="50" y1="40" x2="50" y2="78" stroke={T.gold} strokeWidth="2.5"/><circle cx="50" cy="86" r="7" fill="none" stroke={T.gold} strokeWidth="2"/></svg>
            </div>
            <h2 style={{ fontFamily: "Cinzel, serif", fontSize: fz(24), fontWeight: 500, color: T.inkDark, margin: "0 0 4px" }}>The Holy Rosary</h2>
            <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(15), fontStyle: "italic", color: T.gold, margin: 0 }}>Sacratissimum Rosarium</p>
          </div>
          <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(12), fontWeight: 600, color: T.inkDark, marginBottom: 14 }}>Choose Your Mysteries</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.entries(ROSARY_MYSTERIES).map(([key, m]) => (
              <button key={key} onClick={() => { setMys(key); setScr("pray"); setStep("opening"); setOpenStep(0); setDecade(0); setBead(0); }} style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", padding: "18px 16px", background: T.warmWhite, border: `1px solid ${T.cardBorderStrong}`, borderRadius: 12, cursor: "pointer", textAlign: "left", position: "relative" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: T.goldFaint, display: "flex", alignItems: "center", justifyContent: "center", fontSize: fz(20), flexShrink: 0, border: `1.5px solid rgba(212,168,67,0.2)` }}>{m.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(14), fontWeight: 600, color: T.navyText, marginBottom: 2 }}>{m.label}</div>
                  <div style={{ fontFamily: "EB Garamond, serif", fontSize: fz(14), color: T.inkLight }}>{m.day}</div>
                </div>
                {key === suggested && <span style={{ fontFamily: "Cinzel, serif", fontSize: fz(9), fontWeight: 700, color: T.gold, letterSpacing: "0.06em", textTransform: "uppercase", padding: "3px 8px", background: T.goldFaint, borderRadius: 8, position: "absolute", top: 8, right: 8 }}>Today</span>}
                <span style={{ color: T.gold, fontSize: fz(18) }}>›</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PRAYER FLOW */}
      {scr === "pray" && M && (() => {
        const content = getPrayerContent();
        const progress = getTotalProgress();
        // Immersive layout for all mystery steps that have artwork (ourfather, hailmary, glory, fatima)
        const isImmersive = !content.isAnnounce && !!content.img;
        return (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

            {/* ── Progress bar + decade label — always visible ── */}
            <div style={{ padding: "10px 22px 4px", display: "flex", justifyContent: "space-between", flexShrink: 0 }}>
              <span style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 600, color: T.inkLight, letterSpacing: "0.06em", textTransform: "uppercase" }}>{M.label}</span>
              {step !== "opening" && step !== "closing" && <span style={{ fontFamily: "Cinzel, serif", fontSize: fz(12), fontWeight: 600, color: T.navyText }}>Decade {decade + 1} / 5</span>}
            </div>
            <div style={{ padding: "0 22px 6px", flexShrink: 0 }}>
              <div style={{ height: 3, borderRadius: 2, background: T.goldFaint }}>
                <div style={{ height: "100%", borderRadius: 2, background: `linear-gradient(90deg, ${T.crimson}, ${T.gold})`, width: (progress * 100) + "%", transition: "width 0.3s" }} />
              </div>
            </div>

            {/* ── IMMERSIVE LAYOUT: all mystery steps with artwork ── */}
            {isImmersive && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

                {/* Prayer label + bead counter pinned at top */}
                <div style={{ flexShrink: 0, padding: "6px 22px 8px", background: T.warmWhite, borderBottom: `1px solid ${T.cardBorder}` }}>
                  <div style={{ textAlign: "center", marginBottom: content.beadTotal ? 8 : 0 }}>
                    <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(14), fontWeight: 700, color: T.gold, letterSpacing: "0.08em", textTransform: "uppercase" }}>{content.label}</div>
                    {content.note && <div style={{ fontFamily: "EB Garamond, serif", fontSize: fz(13), fontStyle: "italic", color: T.inkLight, marginTop: 2 }}>{content.note}</div>}
                  </div>
                  {content.beadTotal && (
                    <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                      {Array.from({ length: content.beadTotal }, (_, i) => (
                        <div key={i} style={{
                          width: content.beadTotal > 5 ? 20 : 26,
                          height: content.beadTotal > 5 ? 20 : 26,
                          borderRadius: "50%",
                          background: i < content.beadOf ? T.gold : "transparent",
                          border: `2px solid ${i < content.beadOf ? T.gold : T.inkLight}`,
                          transition: "all 0.3s ease",
                          opacity: i < content.beadOf ? 1 : 0.35,
                          boxShadow: i < content.beadOf ? `0 0 5px rgba(212,168,67,0.5)` : "none",
                        }} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Artwork — tap to advance, object-fit contain so full painting is visible */}
                <div
                  onClick={advance}
                  style={{ flex: 1, position: "relative", overflow: "hidden", cursor: "pointer", WebkitTapHighlightColor: "transparent", minHeight: 0, background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <img
                    src={content.img}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                    onError={e => e.target.style.display = "none"}
                  />
                  {/* Tap hint + credit overlay at bottom */}
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px 14px 8px", background: "linear-gradient(transparent, rgba(0,0,0,0.55))", pointerEvents: "none" }}>
                    <div style={{ textAlign: "center" }}>
                      <span style={{ fontFamily: "Cinzel, serif", fontSize: fz(9), fontWeight: 600, color: "rgba(255,255,255,0.6)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        {content.beadTotal
                          ? (content.beadOf < content.beadTotal ? `Tap image · Bead ${content.beadOf + 1} of ${content.beadTotal}` : "Tap image to continue")
                          : "Tap image to continue"}
                      </span>
                    </div>
                    {content.credit && <div style={{ textAlign: "right", marginTop: 2 }}><span style={{ fontFamily: "EB Garamond, serif", fontSize: fz(8), color: "rgba(255,255,255,0.45)", fontStyle: "italic" }}>{content.credit}</span></div>}
                  </div>
                </div>

                {/* Prayer text — compact strip below artwork, scrollable if needed */}
                <div style={{ flexShrink: 0, padding: "8px 22px 6px", background: T.warmWhite, borderTop: `1px solid ${T.cardBorder}`, maxHeight: "26%", overflowY: "auto" }}>
                  <p style={{ fontFamily: "EB Garamond, serif", fontSize: fs.p, color: T.inkDark, lineHeight: 1.65, margin: 0, whiteSpace: "pre-line" }}>{content.text}</p>
                </div>

                {/* Navigation */}
                <div style={{ padding: "8px 22px 14px", background: T.warmWhite, display: "flex", gap: 10, flexShrink: 0 }}>
                  <div style={{ flex: 1 }}><GhostBtn onClick={goBack}>‹ Back</GhostBtn></div>
                  <div style={{ flex: 1 }}><CrimsonBtn onClick={advance}>
                    {content.beadTotal && content.beadOf < content.beadTotal ? `Bead ${content.beadOf + 1} ›` : "Continue ›"}
                  </CrimsonBtn></div>
                </div>
              </div>
            )}

            {/* ── STANDARD SCROLLABLE LAYOUT: opening, closing, announcements ── */}
            {!isImmersive && (
              <>
                <div style={{ flex: 1, overflowY: "auto", padding: "6px 22px 22px" }}>
                  {/* Mystery announcement */}
                  {content.isAnnounce && (
                    <>
                      {content.img && (
                        <div style={{ borderRadius: 12, overflow: "hidden", marginBottom: 14, position: "relative" }}>
                          <img src={content.img} alt={content.title} style={{ width: "100%", height: "auto", display: "block", minHeight: 100 }} onError={e => e.target.style.display = "none"} />
                          {content.credit && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 10px 6px", background: "linear-gradient(transparent, rgba(0,0,0,0.55))", textAlign: "right" }}>
                            <span style={{ fontFamily: "EB Garamond, serif", fontSize: fz(8), color: "rgba(255,255,255,0.6)", fontStyle: "italic" }}>{content.credit}</span>
                          </div>}
                        </div>
                      )}
                      <div style={{ textAlign: "center", marginBottom: 16 }}>
                        <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(12), fontWeight: 700, color: T.gold, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>{content.label}</div>
                        <h2 style={{ fontFamily: "Cinzel, serif", fontSize: fz(21), fontWeight: 500, color: T.inkDark, margin: "0 0 6px", lineHeight: 1.3 }}>{content.title}</h2>
                        <div style={{ display: "inline-block", padding: "4px 14px", background: T.goldFaint, borderRadius: 12, border: `1px solid rgba(212,168,67,0.15)` }}>
                          <span style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 600, color: T.gold, letterSpacing: "0.06em", textTransform: "uppercase" }}>Fruit: {content.fruit}</span>
                        </div>
                      </div>
                      <Card style={{ borderLeft: `3px solid ${T.navyText}`, marginBottom: 14, background: T.subtleBg }}>
                        <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 700, color: T.navyText, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Scripture · {content.ref}</div>
                        <p style={{ fontFamily: "EB Garamond, serif", fontSize: fs.m, fontStyle: "italic", color: T.inkDark, lineHeight: 1.7, margin: 0 }}>{content.text}</p>
                      </Card>
                      <div style={{ textAlign: "center", margin: "14px 0", padding: "10px 0" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "7px 18px", background: T.goldFaint, borderRadius: 20, border: `1px solid rgba(212,168,67,0.15)` }}>
                          <span style={{ fontSize: fz(13) }}>🕯</span>
                          <span style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 600, color: T.gold, letterSpacing: "0.08em", textTransform: "uppercase" }}>Meditate on this mystery</span>
                          <span style={{ fontSize: fz(13) }}>🕯</span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Opening / closing prayers (no artwork) */}
                  {!content.isAnnounce && (
                    <>
                      <div style={{ textAlign: "center", marginBottom: 16 }}>
                        <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(14), fontWeight: 700, color: T.gold, letterSpacing: "0.08em", textTransform: "uppercase" }}>{content.label}</div>
                        {content.note && <div style={{ fontFamily: "EB Garamond, serif", fontSize: fz(14), fontStyle: "italic", color: T.inkLight, marginTop: 4 }}>{content.note}</div>}
                      </div>
                      {content.beadTotal && (
                        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 16 }}>
                          {Array.from({ length: content.beadTotal }, (_, i) => (
                            <div key={i} style={{
                              width: content.beadTotal > 5 ? 22 : 28,
                              height: content.beadTotal > 5 ? 22 : 28,
                              borderRadius: "50%",
                              background: i < content.beadOf ? T.gold : "transparent",
                              border: `2px solid ${i < content.beadOf ? T.gold : T.inkLight}`,
                              transition: "all 0.3s ease",
                              opacity: i < content.beadOf ? 1 : 0.35,
                            }} />
                          ))}
                        </div>
                      )}
                      <Card style={{ borderLeft: `3px solid ${T.gold}` }}>
                        <p style={{ fontFamily: "EB Garamond, serif", fontSize: fs.p, color: T.inkDark, lineHeight: 1.75, margin: 0, whiteSpace: "pre-line" }}>{content.text}</p>
                      </Card>
                    </>
                  )}
                </div>

                {/* Navigation */}
                <div style={{ padding: "10px 22px 18px", borderTop: `1px solid ${T.cardBorder}`, display: "flex", gap: 10, flexShrink: 0 }}>
                  <div style={{ flex: 1 }}><GhostBtn onClick={goBack}>‹ Back</GhostBtn></div>
                  <div style={{ flex: 1 }}><CrimsonBtn onClick={advance}>
                    {content.beadTotal && content.beadOf < content.beadTotal ? `Bead ${content.beadOf + 1} ›` : "Continue ›"}
                  </CrimsonBtn></div>
                </div>
              </>
            )}
          </div>
        );
      })()}

      {/* COMPLETE */}
      {scr === "complete" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 22px 30px" }}>
          <div style={{ textAlign: "center", marginBottom: 22 }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: "50%", background: T.goldFaint, border: `1.5px solid rgba(212,168,67,0.2)`, marginBottom: 12 }}><span style={{ fontSize: fz(28) }}>🌹</span></div>
            <h2 style={{ fontFamily: "Cinzel, serif", fontSize: fz(22), fontWeight: 500, color: T.inkDark, margin: "0 0 4px" }}>Rosary Complete</h2>
            {M && <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(15), fontStyle: "italic", color: T.gold, margin: 0 }}>{M.label}</p>}
          </div>
          <Card style={{ borderLeft: `3px solid ${T.navyText}`, marginBottom: 18 }}>
            <CardTitle color={T.navyText}>Plenary Indulgence</CardTitle>
            <p style={{ fontFamily: "EB Garamond, serif", fontSize: fs.b, color: T.inkDark, lineHeight: 1.65, margin: 0 }}>The Rosary carries a plenary indulgence under the usual conditions when prayed in a church or oratory, in a family group, or in a religious community. Five decades must be recited continuously, with meditation on the mysteries.</p>
          </Card>
          <Card style={{ borderLeft: `3px solid ${T.crimson}`, marginBottom: 18 }}>
            <CardTitle color={T.crimson}>Sub Tuum Praesidium</CardTitle>
            <p style={{ fontFamily: "EB Garamond, serif", fontSize: fs.p, fontStyle: "italic", color: T.inkDark, lineHeight: 1.7, margin: 0 }}>We fly to thy patronage, O holy Mother of God. Despise not our petitions in our necessities, but deliver us always from all dangers, O glorious and blessed Virgin. Amen.</p>
          </Card>
          <GhostBtn onClick={goHome}>Return Home</GhostBtn>
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
// APP SHELL
// ═══════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// WELCOME SCREEN
// ═══════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════
// ONBOARDING FLOW
// ═══════════════════════════════════════════════════════════════════
const OB_STATES = [
  { id: "single", icon: "🕊", label: "Single", desc: "Unmarried layperson" },
  { id: "married", icon: "💍", label: "Married", desc: "Sacrament of Matrimony" },
  { id: "religious", icon: "📿", label: "Religious", desc: "Consecrated life" },
  { id: "ordained", icon: "⛪", label: "Ordained", desc: "Priest or deacon" },
  { id: "widowed", icon: "🕯", label: "Widowed", desc: "Surviving spouse" },
];

const OB_FREQ = [
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "quarterly", label: "Every few months" },
  { id: "yearly", label: "Once a year or less" },
  { id: "returning", label: "Returning after time away" },
];

const OB_INTERESTS = [
  { id: "rosary", icon: "📿", label: "Holy Rosary" },
  { id: "stations", icon: "✝", label: "Stations of the Cross" },
  { id: "examen", icon: "🕯", label: "Daily Examen" },
  { id: "saints", icon: "🏛", label: "Lives of the Saints" },
  { id: "scripture", icon: "📖", label: "Sacred Scripture" },
  { id: "mercy", icon: "🙏", label: "Divine Mercy" },
];


// ═══════════════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════════════
function SettingsTab({ dark, setDark, fszGlobal, setFszGlobal, goHome, onPrivacy }) {
  const [saved, setSaved] = useState(false);
  const [notifPerm, setNotifPerm] = useState(() => {
    if (typeof Notification !== "undefined") return Notification.permission;
    return "denied";
  });
  const [reminders, setReminders] = useState(() => {
    try {
      const stored = localStorage.getItem("custos_reminders");
      return stored ? JSON.parse(stored) : { prayer: false, confession: false, stations: false };
    } catch { return { prayer: false, confession: false, stations: false }; }
  });

  const saveReminders = (updated) => {
    setReminders(updated);
    try { localStorage.setItem("custos_reminders", JSON.stringify(updated)); } catch {}
  };

  const requestNotifPermission = async () => {
    if (typeof Notification === "undefined") return;
    const perm = await Notification.requestPermission();
    setNotifPerm(perm);
    return perm;
  };

  const toggleReminder = async (key) => {
    const newVal = !reminders[key];
    if (newVal && notifPerm !== "granted") {
      const perm = await requestNotifPermission();
      if (perm !== "granted") {
        // Still save the preference; we'll show in-app indicator
      }
    }
    saveReminders({ ...reminders, [key]: newVal });
  };

  // Flash "saved" indicator on any change
  const prevRef = useRef(JSON.stringify({ dark, fszGlobal }));
  useEffect(() => {
    const cur = JSON.stringify({ dark, fszGlobal });
    if (cur !== prevRef.current) {
      prevRef.current = cur;
      setSaved(true);
      const t = setTimeout(() => setSaved(false), 1200);
      return () => clearTimeout(t);
    }
  }, [dark, fszGlobal]);

  const FSCALES_L = ["Small", "Medium", "Large"];

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 22 }}>
      <div style={{
        fontFamily: "Cinzel, serif", fontSize: fz(11), fontWeight: 700,
        color: T.gold, letterSpacing: "0.08em", textTransform: "uppercase",
        marginBottom: 10, paddingLeft: 2,
      }}>{title}</div>
      <div style={{
        background: T.warmWhite, border: `1px solid ${T.cardBorder}`,
        borderRadius: 14, overflow: "hidden",
      }}>{children}</div>
    </div>
  );

  const Row = ({ icon, label, right, last, onClick }) => (
    <button onClick={onClick || (() => {})} style={{
      display: "flex", alignItems: "center", gap: 12,
      width: "100%", padding: "14px 16px",
      background: "transparent", border: "none",
      borderBottom: last ? "none" : `1px solid ${T.cardBorder}`,
      cursor: onClick ? "pointer" : "default", textAlign: "left",
    }}>
      {icon && <span style={{ fontSize: 18, width: 24, textAlign: "center", flexShrink: 0 }}>{icon}</span>}
      <span style={{
        flex: 1, fontFamily: "EB Garamond, serif", fontSize: fz(16),
        color: T.inkDark,
      }}>{label}</span>
      {right}
    </button>
  );

  const Toggle = ({ on, onToggle }) => (
    <div onClick={(e) => { e.stopPropagation(); onToggle(); }} style={{
      width: 46, height: 26, borderRadius: 13, cursor: "pointer",
      background: on ? T.gold : T.inkLight, position: "relative",
      transition: "background 0.3s ease", flexShrink: 0,
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: "50%", background: "#fff",
        position: "absolute", top: 3,
        left: on ? 23 : 3,
        transition: "left 0.3s ease",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </div>
  );

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <TopBar title="Settings" showBack={true} onBack={goHome} rightAction={
        <div style={{
          fontFamily: "EB Garamond, serif", fontSize: fz(13), fontStyle: "italic",
          color: T.gold, opacity: saved ? 1 : 0, transition: "opacity 0.3s ease",
          width: 50, textAlign: "right",
        }}>{saved ? "Saved" : ""}</div>
      } />
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px 30px" }}>

        {/* ═══ APPEARANCE ═══ */}
        <Section title="Appearance">
          <Row icon="🌙" label="Dark Mode" right={<Toggle on={dark} onToggle={() => setDark(!dark)} />} />
          <Row icon="🔤" label="Text Size" last right={
            <div style={{ display: "flex", gap: 4 }}>
              {[0, 1, 2].map(i => (
                <button key={i} onClick={(e) => { e.stopPropagation(); setFszGlobal(i); }} style={{
                  padding: "4px 10px", fontFamily: "Cinzel, serif",
                  fontSize: i === 0 ? 11 : i === 1 ? 13 : 15, fontWeight: 600,
                  color: fszGlobal === i ? T.warmWhite : T.inkLight,
                  background: fszGlobal === i ? T.navy : "transparent",
                  border: `1px solid ${fszGlobal === i ? T.navy : T.cardBorderStrong}`,
                  borderRadius: 6, cursor: "pointer", lineHeight: 1.3,
                }}>A</button>
              ))}
            </div>
          } />
        </Section>


        {/* ═══ REMINDERS ═══ */}
        <Section title="Daily Reminders">
          {notifPerm === "denied" && (reminders.prayer || reminders.confession || reminders.stations) && (
            <div style={{ padding: "10px 16px", borderBottom: `1px solid ${T.cardBorder}`, background: T.goldFaint }}>
              <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(13), color: T.inkMid, margin: 0, fontStyle: "italic" }}>
                Browser notifications are blocked. Reminders will appear as banners in the Today tab instead.
              </p>
            </div>
          )}
          <Row icon="🙏" label="Morning Prayer Reminder" right={<Toggle on={reminders.prayer} onToggle={() => toggleReminder("prayer")} />} />
          <Row icon="⚖" label="Confession Reminder" right={<Toggle on={reminders.confession} onToggle={() => toggleReminder("confession")} />} />
          <Row icon="✝" label="Stations of the Cross" last right={<Toggle on={reminders.stations} onToggle={() => toggleReminder("stations")} />} />
        </Section>

        {/* ═══ ABOUT ═══ */}
        <Section title="About Custos">
          <Row icon="📖" label="Version 1.0 (Lent 2026)" right={
            <span style={{ fontFamily: "EB Garamond, serif", fontSize: fz(13), color: T.inkLight }}>askcustos.com</span>
          } />
          <Row icon="📜" label="Privacy & Data" last right={
            <span style={{ color: T.gold, fontSize: 14 }}>›</span>
          } onClick={onPrivacy} />
        </Section>

        {/* Disclaimer */}
        <div style={{
          padding: "16px 14px", background: T.subtleBg,
          borderRadius: 12, textAlign: "center", marginBottom: 16,
        }}>
          <p style={{
            fontFamily: "EB Garamond, serif", fontSize: fz(13.5), fontStyle: "italic",
            color: T.inkLight, margin: 0, lineHeight: 1.55,
          }}>Custos is a devotional aid rooted in the Catholic moral tradition. It supplements — never replaces — the guidance of a confessor, spiritual director, or the Magisterium of the Church.</p>
        </div>

        <p style={{
          fontFamily: "EB Garamond, serif", fontSize: fz(12),
          color: T.inkLight, textAlign: "center", margin: "8px 0 0",
          fontStyle: "italic",
        }}>Ad maiorem Dei gloriam</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// DAILY TRIVIA — Catholic history, theology, liturgy
// ═══════════════════════════════════════════════════════════════════

const TRIVIA_BANK = [
  // ── HISTORY ──
  { cat: "History", q: "In what year did the Council of Nicaea define the divinity of Christ against Arianism?", a: "325 AD", detail: "The First Council of Nicaea (325 AD) produced the Nicene Creed, declaring the Son 'consubstantial with the Father' — homoousios — against Arius, who taught the Son was a creature.", attr: "Council of Nicaea (325)", seasons: [] },
  { cat: "History", q: "Which pope declared the dogma of the Immaculate Conception in 1854?", a: "Pope Pius IX", detail: "With the bull Ineffabilis Deus, Pius IX defined that the Blessed Virgin Mary was preserved from original sin from the first moment of her conception.", attr: "Ineffabilis Deus (1854)", seasons: [] },
  { cat: "History", q: "What year did the Great Schism split Eastern and Western Christianity?", a: "1054 AD", detail: "Cardinal Humbert placed a bull of excommunication on the altar of Hagia Sophia on July 16, 1054, formalizing the split between Rome and Constantinople.", attr: "Church History", seasons: [] },
  { cat: "History", q: "Which ecumenical council defined the canon of Sacred Scripture?", a: "Council of Trent (1546)", detail: "Session IV of the Council of Trent formally defined the 73-book canon of Scripture, including the deuterocanonical books rejected by Protestants.", attr: "Council of Trent", seasons: [] },
  { cat: "History", q: "What was the name of the edict that granted Christians legal status in the Roman Empire?", a: "Edict of Milan (313 AD)", detail: "Emperors Constantine I and Licinius issued the Edict of Milan, granting freedom of worship throughout the empire and ending the persecutions.", attr: "Church History", seasons: [] },
  { cat: "History", q: "In what century did St. Benedict write his Rule for monasteries?", a: "6th century (c. 530 AD)", detail: "The Rule of St. Benedict, written around 530 AD at Monte Cassino, became the foundation of Western monasticism and is still followed by Benedictines today.", attr: "Rule of St. Benedict", seasons: [] },
  { cat: "History", q: "Which pope called the Second Vatican Council?", a: "Pope John XXIII", detail: "Pope John XXIII announced Vatican II on January 25, 1959. It opened in October 1962, though he died in June 1963 before its conclusion.", attr: "Vatican II", seasons: [] },
  { cat: "History", q: "In what ancient city did St. Augustine of Hippo serve as bishop?", a: "Hippo Regius (modern Algeria)", detail: "Augustine served as Bishop of Hippo Regius in North Africa from 395 until his death in 430 AD as the Vandals besieged the city.", attr: "Life of St. Augustine", seasons: [] },
  { cat: "History", q: "Which pope defined papal infallibility as a dogma?", a: "Pope Pius IX at Vatican I (1870)", detail: "The First Vatican Council defined papal infallibility in Pastor Aeternus (1870): the pope speaks infallibly ex cathedra on faith and morals.", attr: "Pastor Aeternus (1870)", seasons: [] },
  { cat: "History", q: "What order did St. Dominic found to combat the Albigensian heresy?", a: "The Order of Preachers (Dominicans)", detail: "Dominic de Guzmán founded the Order of Preachers c. 1216, emphasizing preaching, study, and poverty to counter the Cathar heresy in southern France.", attr: "Dominican Order", seasons: [] },
  { cat: "History", q: "In what year did Pope Urban II preach the First Crusade?", a: "1095 AD at the Council of Clermont", detail: "On November 27, 1095, Urban II called upon Christians to liberate Jerusalem, launching the First Crusade.", attr: "Church History", seasons: [] },
  { cat: "History", q: "Which empress convened the Second Council of Nicaea (787), restoring veneration of icons?", a: "Empress Irene of Byzantium", detail: "Irene acted as regent for her son Constantine VI and convened the Seventh Ecumenical Council, which condemned iconoclasm and restored veneration of sacred images.", attr: "Second Council of Nicaea", seasons: [] },
  { cat: "History", q: "What heresy did the Council of Ephesus (431) condemn when it declared Mary 'Theotokos'?", a: "Nestorianism", detail: "Nestorius, Archbishop of Constantinople, denied Mary the title 'God-bearer' (Theotokos), effectively dividing Christ into two persons. The Council of Ephesus condemned this and defined Mary as Theotokos.", attr: "Council of Ephesus (431)", seasons: [] },
  { cat: "History", q: "What was the Babylonian Captivity of the Church?", a: "The period 1309–1377 when popes resided in Avignon, France, instead of Rome", detail: "Clement V moved the papacy to Avignon under pressure from the French crown. Seven popes reigned there over 68 years. St. Catherine of Siena famously urged Gregory XI to return to Rome.", attr: "Church History", seasons: [] },
  { cat: "History", q: "Who was the first pope, and what does the name 'Peter' mean?", a: "St. Peter (Simon bar Jonah); 'Peter' means 'Rock' in Greek (Petros)", detail: "Christ gave Simon the name Kepha/Petros — Rock — at Caesarea Philippi (Mt 16:18), promising to build His Church upon this rock.", attr: "Mt 16:18", seasons: [] },
  { cat: "History", q: "In what year did Martin Luther post his Ninety-Five Theses?", a: "1517", detail: "On October 31, 1517, Luther reportedly posted his theses challenging indulgence practices on the door of the Castle Church in Wittenberg, sparking the Protestant Reformation.", attr: "Church History", seasons: [] },
  { cat: "History", q: "What was the Counter-Reformation council that defined Catholic doctrine against Protestant challenges?", a: "The Council of Trent (1545–1563)", detail: "The Council of Trent met in 25 sessions over 18 years, defining doctrines on Scripture, Tradition, justification, the sacraments, and the Mass — the theological backbone of the Catholic response to the Reformation.", attr: "Council of Trent", seasons: [] },
  { cat: "History", q: "Which pope issued the encyclical Rerum Novarum (1891), the founding document of modern Catholic social teaching?", a: "Pope Leo XIII", detail: "Rerum Novarum addressed the condition of workers in industrial society, affirming the rights of labor, private property, just wages, and the duties of both employers and the state.", attr: "Rerum Novarum (1891)", seasons: [] },
  { cat: "History", q: "In what century did St. Patrick evangelize Ireland?", a: "5th century (c. 432 AD)", detail: "Patrick, a Romano-British Christian who had been enslaved in Ireland as a youth, returned as a missionary bishop around 432 AD and evangelized the Irish over some 30 years.", attr: "Life of St. Patrick", seasons: [] },
  { cat: "History", q: "What is Papal Infallibility, and how many times has it been formally invoked?", a: "The pope is preserved from error when speaking ex cathedra on faith and morals; invoked formally twice: 1854 (Immaculate Conception) and 1950 (Assumption)", detail: "The dogma was defined at Vatican I (1870). It was exercised ex cathedra by Pius IX in 1854 and Pius XII in 1950 for the Assumption of Mary.", attr: "Pastor Aeternus (1870)", seasons: [] },
  { cat: "History", q: "Which 4th-century bishop single-handedly defended Nicene orthodoxy against an Arian majority?", a: "St. Athanasius of Alexandria", detail: "Athanasius was exiled five times for defending the Nicene definition against Arian emperors and bishops. His tenacity earned the phrase 'Athanasius contra mundum' — Athanasius against the world.", attr: "Church History", seasons: [] },
  { cat: "History", q: "What apparition did Our Lady appear in 1917, requesting the Rosary and the consecration of Russia?", a: "Fatima, Portugal", detail: "The Virgin Mary appeared to Lucia, Francisco, and Jacinta from May to October 1917, revealing three secrets and requesting prayer, penance, and the consecration of Russia to her Immaculate Heart.", attr: "Fatima (1917)", seasons: [] },
  { cat: "History", q: "In what century was the Summa Theologiae of St. Thomas Aquinas written?", a: "13th century (c. 1265–1274)", detail: "Aquinas began the Summa around 1265 and left it unfinished at his death in 1274, famously declaring after a mystical experience that all he had written seemed 'like straw.'", attr: "St. Thomas Aquinas", seasons: [] },
  { cat: "History", q: "What did Emperor Theodosius I declare in the Edict of Thessalonica (380 AD)?", a: "Nicene Christianity the official religion of the Roman Empire", detail: "The edict declared that all peoples of the empire should hold to the Nicene faith of the bishops of Rome and Alexandria, effectively establishing Catholicism as the state religion.", attr: "Church History", seasons: [] },
  { cat: "History", q: "Who wrote the Confessions, the first great spiritual autobiography in history?", a: "St. Augustine of Hippo", detail: "Written c. 397–400 AD, the Confessions traces Augustine's journey from paganism through Manichaeism to baptism, opening with the famous line: 'Our hearts are restless until they rest in Thee.'", attr: "St. Augustine, Confessions", seasons: [] },
  { cat: "History", q: "The Franciscan Order was founded by St. Francis of Assisi. In what year was it formally approved?", a: "1209 (Rule approved verbally by Innocent III)", detail: "Francis and his first 12 companions traveled to Rome in 1209, where Pope Innocent III gave verbal approval to their way of life. The written Rule was confirmed by Honorius III in 1223.", attr: "Franciscan Order", seasons: [] },

  // ── THEOLOGY ──
  { cat: "Theology", q: "What are the three theological virtues?", a: "Faith, Hope, and Charity", detail: "St. Paul names them in 1 Corinthians 13:13. They are called 'theological' because they relate directly to God; they are infused — not acquired — by God at Baptism.", attr: "CCC 1813", seasons: [] },
  { cat: "Theology", q: "What is the Hypostatic Union?", a: "Christ has two natures — divine and human — in one divine Person", detail: "Defined at the Council of Chalcedon (451 AD), the Hypostatic Union teaches that the Son of God assumed a full human nature while remaining fully divine: two natures without confusion or separation.", attr: "Council of Chalcedon (451)", seasons: [] },
  { cat: "Theology", q: "According to St. Thomas Aquinas, what is the definition of law?", a: "An ordinance of reason for the common good, made by one who has care of the community, and promulgated", detail: "Thomas defines law in the Summa Theologiae (I-II, Q.90): it must be rational, directed to the common good, made by legitimate authority, and made known through promulgation.", attr: "Summa Theologiae I-II, Q.90", seasons: [] },
  { cat: "Theology", q: "What are the four marks of the Church?", a: "One, Holy, Catholic, and Apostolic", detail: "These four marks, professed in the Nicene Creed, describe the essential characteristics of the Church Christ founded, distinguishing it from any merely human institution.", attr: "CCC 811", seasons: [] },
  { cat: "Theology", q: "What three conditions make a sin mortal?", a: "Grave matter, full knowledge, and deliberate consent", detail: "All three must be present for a sin to be mortal. Without any one of them — if the matter is light, or knowledge incomplete, or consent compromised — the sin is venial.", attr: "CCC 1857", seasons: [] },
  { cat: "Theology", q: "What does the Church teach about the Real Presence in the Eucharist?", a: "Christ is truly, really, and substantially present — Body, Blood, Soul, and Divinity", detail: "The Council of Trent defined transubstantiation: the entire substance of bread and wine is converted into the Body and Blood of Christ, while the appearances remain.", attr: "Council of Trent, Session XIII", seasons: [] },
  { cat: "Theology", q: "What is the Beatific Vision?", a: "The direct, unmediated vision of God enjoyed by the saints in heaven", detail: "The Beatific Vision is the ultimate end of man — seeing God face to face (1 Cor 13:12). It is supernatural, beyond any natural capacity, and is the source of perfect happiness.", attr: "CCC 1023–1026", seasons: [] },
  { cat: "Theology", q: "How many sacraments does the Catholic Church have, and who defined this number?", a: "Seven, defined at the Council of Florence (1439) and reaffirmed at Trent", detail: "Baptism, Confirmation, Eucharist, Penance, Anointing of the Sick, Holy Orders, and Matrimony.", attr: "Council of Trent, Session VII", seasons: [] },
  { cat: "Theology", q: "What is the doctrine of Original Sin?", a: "The sin of Adam, transmitted to all humanity, depriving us of sanctifying grace and wounding human nature", detail: "Defined at the Council of Trent, original sin is not a personal act but a state of deprivation inherited from Adam. It is remitted by Baptism.", attr: "CCC 402–406", seasons: [] },
  { cat: "Theology", q: "What does 'ex opere operato' mean in sacramental theology?", a: "Sacraments confer grace by the performance of the sacramental act itself, not by the merit of the minister", detail: "The sacrament's efficacy depends on Christ acting through the Church, not on the holiness of the priest (though the recipient's dispositions affect the fruit received).", attr: "CCC 1128", seasons: [] },
  { cat: "Theology", q: "What are the four cardinal virtues?", a: "Prudence, Justice, Fortitude, and Temperance", detail: "These 'hinge' virtues (from the Latin cardo, hinge) are the foundation of the moral life. They can be acquired by human effort and perfected by grace. All other moral virtues are grouped around them.", attr: "CCC 1805", seasons: [] },
  { cat: "Theology", q: "What is the 'sensus fidei'?", a: "The supernatural instinct of the faithful for recognizing truths of the faith", detail: "The sensus fidei (sense of the faith) is a gift of the Holy Spirit by which the whole body of the faithful cannot err in matters of belief (Lumen Gentium 12).", attr: "Lumen Gentium 12", seasons: [] },
  { cat: "Theology", q: "What is the doctrine of the Assumption of Mary?", a: "At the end of her earthly life, the Blessed Virgin Mary was taken up body and soul into heavenly glory", detail: "Defined as dogma by Pope Pius XII in Munificentissimus Deus (1950), the Assumption is not explicitly narrated in Scripture but is grounded in Tradition and the Church's understanding of Mary's unique role.", attr: "Munificentissimus Deus (1950)", seasons: [] },
  { cat: "Theology", q: "What is Natural Law, according to St. Thomas Aquinas?", a: "The rational creature's participation in the eternal law of God — the moral order inscribed in human nature and discoverable by reason", detail: "Aquinas teaches in the Summa (I-II, Q.94) that natural law is the first principle of practical reason: do good and avoid evil. From this, more specific norms are derived.", attr: "Summa Theologiae I-II, Q.94", seasons: [] },
  { cat: "Theology", q: "What is the difference between justification and sanctification?", a: "Justification is the initial remission of sin and infusion of grace; sanctification is the ongoing growth in holiness that follows", detail: "The Council of Trent (Session VI) defined justification as not merely the remission of sins but a true interior renewal. Sanctification describes the ongoing transformation into likeness with Christ.", attr: "Council of Trent, Session VI", seasons: [] },
  { cat: "Theology", q: "What does 'Purgatory' mean in Catholic doctrine?", a: "A state of purification after death for those who die in God's grace but still need cleansing before entering heaven", detail: "The Church teaches (CCC 1030) that those who die in God's friendship but imperfectly purified undergo purification to achieve the holiness needed to enter heavenly joy.", attr: "CCC 1030–1032", seasons: [] },
  { cat: "Theology", q: "What are the seven gifts of the Holy Spirit?", a: "Wisdom, Understanding, Counsel, Fortitude, Knowledge, Piety, and Fear of the Lord", detail: "These gifts perfect the soul's capacity for virtue and are infused at Baptism and strengthened at Confirmation. They are drawn from Isaiah 11:2–3.", attr: "CCC 1831", seasons: [] },
  { cat: "Theology", q: "What is Transubstantiation?", a: "The complete conversion of the substance of bread and wine into the Body and Blood of Christ at the consecration of the Mass", detail: "Defined at the Fourth Lateran Council (1215) and confirmed at Trent: the accidents (appearances) remain, but the substance is entirely changed into Christ.", attr: "Council of Trent, Session XIII", seasons: [] },
  { cat: "Theology", q: "What is the 'double effect' principle in Catholic moral theology?", a: "An action with both good and bad effects may be permissible if the act is not intrinsically evil, the agent intends the good effect, and the good is proportionate to the harm", detail: "St. Thomas Aquinas first articulated this principle in discussing self-defense (Summa II-II, Q.64). It governs many complex medical and ethical decisions.", attr: "Summa Theologiae II-II, Q.64", seasons: [] },
  { cat: "Theology", q: "What does the Church mean by 'intrinsically evil' acts?", a: "Acts that are evil by their very object, regardless of intention or circumstances — they can never be justified", detail: "CCC 1756 teaches that certain acts are 'by their very object morally disordered' and 'are always and without exception unlawful' regardless of purpose or context.", attr: "CCC 1756", seasons: [] },
  { cat: "Theology", q: "What is the 'preferential option for the poor' in Catholic social teaching?", a: "The obligation to give priority attention to the needs and rights of the poor in moral decision-making and social policy", detail: "While not favoring the poor exclusively, the Church teaches (CCC 2448) a special love for the poor following Christ's example and the prophets' call for justice.", attr: "CCC 2448", seasons: [] },
  { cat: "Theology", q: "What does the phrase 'Fiat voluntas tua' mean, and where does it appear?", a: "'Thy will be done' — from the Lord's Prayer (Mt 6:10) and Christ's prayer in Gethsemane (Mt 26:42)", detail: "The phrase expresses the complete surrender of human will to divine providence. It is both a petition and an act of trust.", attr: "Mt 6:10; 26:42", seasons: [] },
  { cat: "Theology", q: "What does the Church teach about conscience?", a: "Conscience is the proximate norm of morality — one must always follow it, but it must be formed in accordance with truth and Church teaching", detail: "CCC 1776 defines conscience as 'a judgment of reason whereby the human person recognizes the moral quality of a concrete act.' It must be educated; an erroneous conscience does not excuse culpability if the error is one's own fault.", attr: "CCC 1776–1779", seasons: [] },
  { cat: "Theology", q: "What are the corporal works of mercy?", a: "Feed the hungry, give drink to the thirsty, clothe the naked, shelter the homeless, visit the sick, visit the imprisoned, bury the dead", detail: "Based on Matthew 25:31–46 and Tobit 1:17. They address bodily needs and are balanced by the seven spiritual works of mercy.", attr: "CCC 2447", seasons: [] },
  { cat: "Theology", q: "What is the distinction between the Church Militant, Church Suffering, and Church Triumphant?", a: "The living faithful on earth (Militant), the souls in Purgatory (Suffering), and the saints in heaven (Triumphant) — together, the Communion of Saints", detail: "This distinction expresses the Church's reach across life and death. We can assist the souls in Purgatory through prayer, Masses, and indulgences.", attr: "CCC 954–959", seasons: [] },
  { cat: "Theology", q: "What does 'Magisterium' mean?", a: "The teaching authority of the Church, exercised by the pope and bishops in communion with him", detail: "From the Latin magister (teacher), the Magisterium is the Church's living authority to interpret Scripture and Tradition authentically. It can be exercised solemnly (ex cathedra, councils) or ordinarily (regular papal teaching).", attr: "CCC 85–87", seasons: [] },

  // ── LITURGY ──
  { cat: "Liturgy", q: "What are the five parts of the Ordinary of the Mass?", a: "Kyrie, Gloria, Credo, Sanctus, and Agnus Dei", detail: "These fixed texts recur at every Mass (the Gloria and Credo are omitted on certain days). They give the Mass its enduring structure regardless of the feast.", attr: "Roman Rite", seasons: [] },
  { cat: "Liturgy", q: "What liturgical color is worn during Advent and Lent?", a: "Violet (purple)", detail: "Violet signifies penance, preparation, and longing. Rose may be worn on Gaudete Sunday (Advent III) and Laetare Sunday (Lent IV), expressing mid-season joy.", attr: "Roman Rite", seasons: ["Advent","Lent"] },
  { cat: "Liturgy", q: "What is the Introit?", a: "The entrance antiphon sung at the beginning of Mass", detail: "The Introit is the first chant of the Proper of the Mass, sung as the priest approaches the altar. Its text, drawn from Scripture, sets the spiritual tone of each feast.", attr: "Roman Rite", seasons: [] },
  { cat: "Liturgy", q: "What does 'ad orientem' worship mean?", a: "Celebrating Mass with the priest and people facing the same direction — toward God (liturgical East)", detail: "Historically, both priest and faithful faced East, symbolizing the eschatological expectation of Christ's return. It was standard before the post-Vatican II reform of altar orientation.", attr: "Liturgical Tradition", seasons: [] },
  { cat: "Liturgy", q: "What is the Liturgy of the Hours?", a: "The daily prayer of the Church, sanctifying the hours of the day — from Lauds to Compline", detail: "The Divine Office (CCC 1174–1178) extends the Eucharist's praise through the day: Lauds, Terce, Sext, None, Vespers, Compline, and the Office of Readings.", attr: "CCC 1174–1178", seasons: [] },
  { cat: "Liturgy", q: "What is Septuagesima?", a: "The pre-Lenten season in the traditional calendar, beginning 70 days before Easter", detail: "Septuagesima, Sexagesima, and Quinquagesima Sundays form a three-week preparation before Ash Wednesday in the 1962 calendar. The Alleluia is omitted during this season.", attr: "1962 Roman Missal", seasons: ["Septuagesima · Pre-Lent"] },
  { cat: "Liturgy", q: "What is the significance of the Alleluia being suppressed during Lent?", a: "It symbolizes mourning and penance — the joy of the Resurrection is 'buried' until Easter", detail: "In the traditional rite, the Alleluia is ceremonially 'buried' at the end of Quinquagesima. Its joyful return at the Easter Vigil marks the great night of resurrection.", attr: "Roman Rite · Lenten Tradition", seasons: ["Lent","Septuagesima · Pre-Lent"] },
  { cat: "Liturgy", q: "What is the Proper of the Mass?", a: "The variable texts that change with each feast: Introit, Gradual, Alleluia/Tract, Offertory, and Communion antiphons", detail: "The Proper contrasts with the Ordinary (fixed texts). The Proper texts are drawn from Scripture and give each day's Mass its unique spiritual character.", attr: "Roman Rite", seasons: [] },
  { cat: "Liturgy", q: "What does 'Canon of the Mass' refer to?", a: "The central Eucharistic prayer, traditionally the Roman Canon (now Eucharistic Prayer I)", detail: "The Roman Canon is one of the oldest texts in Christendom, with roots in the 4th century. It includes the consecratory words, intercessions, memento for the living and dead, and doxology.", attr: "Roman Rite", seasons: [] },
  { cat: "Liturgy", q: "On what day is the Church's oldest and most solemn liturgy celebrated?", a: "Holy Saturday — the Easter Vigil", detail: "The Easter Vigil is the 'mother of all vigils' (St. Augustine). It begins in darkness, includes the lighting of the Paschal Candle, the Exsultet, extensive Scripture readings, Baptisms, and the first Mass of Easter.", attr: "Easter Vigil", seasons: ["Eastertide","Passiontide"] },
  { cat: "Liturgy", q: "What is Gregorian Chant?", a: "The ancient monophonic sacred music of the Roman Rite, traditionally attributed to Pope Gregory the Great", detail: "Gregorian chant is the Church's own music, called 'treasure of inestimable value' by Vatican II's Sacrosanctum Concilium (§114). It is the normative music of the Latin rite.", attr: "Sacrosanctum Concilium §114", seasons: [] },
  { cat: "Liturgy", q: "What is the 'Collect'?", a: "The opening prayer of the Mass that 'collects' the intentions of the congregation and addresses them to God", detail: "The Collect is the first of three variable presidential prayers (with the Secret/Prayer over the Offerings and the Postcommunion). It concludes with 'through Christ our Lord.'", attr: "Roman Rite", seasons: [] },
  { cat: "Liturgy", q: "What does the color red signify in liturgical vestments?", a: "The Holy Spirit, martyrdom, and royal dignity — worn on Pentecost, feasts of martyrs, Palm Sunday, and Good Friday", detail: "Red recalls both fire (the Holy Spirit at Pentecost) and blood (the martyrs). It is the color of sacrifice and the kingship of Christ.", attr: "Roman Rite", seasons: [] },
  { cat: "Liturgy", q: "What are the Major Rogation Days?", a: "April 25 (feast of St. Mark) — days of litanies and processions to pray for crops and protection from calamity", detail: "The Major Rogation on April 25 and the Minor Rogations (Monday–Wednesday before Ascension) are ancient penitential days with outdoor processions, the Litany of the Saints, and prayer for God's blessing on the harvest.", attr: "Roman Rite", seasons: [] },
  { cat: "Liturgy", q: "What is the 'Ordinary Form' and 'Extraordinary Form' of the Roman Rite?", a: "The 1970 Missal (OF) and the 1962 Missal (EF/Traditional Latin Mass) — two forms of one Roman Rite", detail: "Benedict XVI in Summorum Pontificum (2007) designated these two forms, allowing the Traditional Latin Mass to be celebrated more widely.", attr: "Summorum Pontificum (2007)", seasons: [] },
  { cat: "Liturgy", q: "What is the Gradual?", a: "A chant sung between the Epistle and Gospel in the traditional Mass, named for the 'step' (gradus) of the ambo from which it was sung", detail: "The Gradual is among the most ancient and musically elaborate chants of the Mass. It is replaced by the Alleluia in Eastertide (except at Requiem Masses).", attr: "1962 Roman Missal", seasons: [] },
  { cat: "Liturgy", q: "What does the term 'anamnesis' mean in liturgical theology?", a: "The ritual memorial of Christ's Passion, Death, and Resurrection — a making-present of past saving events, not merely a remembrance", detail: "From the Greek for 'remembrance,' the anamnesis in the Eucharistic prayer (Do this in memory of Me) is understood not as mere recollection but as a sacramental participation in the original events.", attr: "CCC 1362–1364", seasons: [] },
  { cat: "Liturgy", q: "What vestment does a bishop wear that a priest does not?", a: "The miter, pectoral cross, and ring — and the pallium for archbishops", detail: "The miter is the bishop's ceremonial headdress. The pectoral cross is worn over vestments. The pallium — a woolen band worn over the chasuble — is granted by the pope to archbishops and signifies their union with Rome.", attr: "Liturgical Tradition", seasons: [] },
  { cat: "Liturgy", q: "What is the difference between a Feast, a Solemnity, and a Memorial?", a: "In the current calendar: Solemnities are the highest rank, then Feasts, then Obligatory Memorials, then Optional Memorials", detail: "Solemnities celebrate the most important mysteries (Christmas, Easter, Corpus Christi). Feasts celebrate events in the Lord's life and major saints. Memorials honor saints with less universal prominence.", attr: "Roman Rite", seasons: [] },

  // ── SEASON-SPECIFIC ──
  // Advent
  { cat: "Liturgy", q: "How many Sundays are in the season of Advent?", a: "Four Sundays", detail: "Advent spans four Sundays before Christmas. Each week increases in eschatological anticipation: the Second Coming, John the Baptist, the prophets, and the Virgin Mary.", attr: "Roman Rite", seasons: ["Advent"] },
  { cat: "History", q: "What ancient prophecy does the Church read every Advent about a virgin bearing a son?", a: "Isaiah 7:14 — 'Behold, a virgin shall conceive and bear a son, and his name shall be called Emmanuel'", detail: "This 8th-century BC prophecy is quoted in Matthew 1:23 as fulfilled in the Virgin Birth. It is a central text of the Advent liturgy.", attr: "Isaiah 7:14", seasons: ["Advent"] },
  { cat: "Theology", q: "What is the 'O Antiphons' of Advent?", a: "Seven ancient antiphons sung before the Magnificat at Vespers from December 17–23, each beginning 'O' and invoking a title of Christ", detail: "O Sapientia, O Adonai, O Radix Jesse, O Clavis David, O Oriens, O Rex Gentium, O Emmanuel — the first letters in reverse spell SARCORE, or re-arranged, ERO CRAS — 'I will be [there] tomorrow.'", attr: "Advent Liturgy", seasons: ["Advent"] },
  { cat: "Liturgy", q: "What is Gaudete Sunday?", a: "The Third Sunday of Advent — a day of rejoicing (gaudete = 'rejoice') when the penitential fast is briefly relaxed", detail: "Named from the entrance antiphon (Philippians 4:4), Gaudete Sunday is marked by rose vestments (rather than violet), flowers, and organ music, anticipating the joy of Christmas.", attr: "Roman Rite", seasons: ["Advent"] },

  // Christmas
  { cat: "Theology", q: "What does the Incarnation mean?", a: "The eternal Son of God took on human flesh and became man in the womb of the Virgin Mary", detail: "John 1:14 — 'And the Word was made flesh.' The Incarnation is not a transformation of God but an assumption of human nature: one divine Person, two natures.", attr: "CCC 461–463", seasons: ["Christmastide"] },
  { cat: "Liturgy", q: "What are the Twelve Days of Christmas?", a: "December 25 (Christmas) through January 5, ending on the Epiphany (January 6)", detail: "The Christmas octave ends on January 1, the Circumcision/Solemnity of Mary. The full Christmas season extends to the Baptism of the Lord (or, in the traditional calendar, Candlemas, February 2).", attr: "Roman Rite", seasons: ["Christmastide"] },

  // Lent
  { cat: "Theology", q: "What are the three Lenten disciplines the Church commends?", a: "Prayer, Fasting, and Almsgiving", detail: "Jesus names these in Matthew 6:1–18. The Church channels them through Lent as preparation for the Paschal Mystery.", attr: "CCC 1434", seasons: ["Lent"] },
  { cat: "History", q: "When did the practice of marking foreheads with ash on Ash Wednesday become universal in Rome?", a: "It developed through the early medieval period, widely observed by the 11th century", detail: "The use of ashes as a sign of penitence is biblical (Job, Jonah, Esther). The Roman practice of Ash Wednesday as the formal start of Lent became universal by the time of Gregory VII (d. 1085).", attr: "Liturgical History", seasons: ["Lent"] },
  { cat: "Liturgy", q: "What is Laetare Sunday?", a: "The Fourth Sunday of Lent — a day of rejoicing midway through Lent, marked by rose vestments", detail: "Named from the entrance antiphon ('Laetare Jerusalem — Rejoice, O Jerusalem'), Laetare Sunday mirrors Gaudete Sunday in Advent: a brief relaxation of penitential observance.", attr: "Roman Rite", seasons: ["Lent"] },

  // Holy Week / Passiontide
  { cat: "Liturgy", q: "What is Tenebrae?", a: "A nocturnal Holy Week office in which candles are extinguished one by one to symbolize Christ's approaching death", detail: "Tenebrae (Latin for 'darkness') combines Matins and Lauds for Wednesday, Thursday, and Friday of Holy Week. As each candle is snuffed, the church grows dark.", attr: "Holy Week Liturgy", seasons: ["Passiontide"] },
  { cat: "History", q: "What is the Mandatum, performed on Holy Thursday?", a: "The washing of feet, recalling Christ's washing of the Apostles' feet at the Last Supper (Jn 13)", detail: "The word 'Mandatum' comes from Christ's command: 'A new commandment I give you, that you love one another' (Jn 13:34). The ceremony follows the Mass of the Lord's Supper.", attr: "Holy Thursday Liturgy", seasons: ["Passiontide"] },
  { cat: "Theology", q: "What does the Church teach about the meaning of Good Friday?", a: "Christ's death on the Cross is the sacrifice by which He redeems humanity — the fulfillment of all Old Testament sacrifices", detail: "On Good Friday alone, no Mass is celebrated. The liturgy includes veneration of the Cross and a service of the Word, recalling that all sacramental life flows from the Cross.", attr: "CCC 613–615", seasons: ["Passiontide"] },

  // Easter
  { cat: "Theology", q: "What does 'Paschal Mystery' refer to?", a: "Christ's Passion, Death, Resurrection, and Ascension — through which He redeems humanity", detail: "The Paschal Mystery (CCC 571) is the center of the Christian faith. Through it, Christ passes from death to life and opens the way of salvation for all who are united to Him in Baptism.", attr: "CCC 571", seasons: ["Eastertide"] },
  { cat: "Liturgy", q: "What is the Exsultet?", a: "The ancient Easter proclamation (Praeconium Paschale) sung at the Easter Vigil, celebrating the Resurrection", detail: "Possibly composed in part by St. Ambrose, the Exsultet is one of the Church's oldest hymns. It famously praises even the 'felix culpa' — 'O happy fault that merited so great a Redeemer.'", attr: "Easter Vigil", seasons: ["Eastertide"] },
  { cat: "History", q: "What is the Octave of Easter?", a: "The eight days following Easter Sunday (through Divine Mercy Sunday), all celebrated as one prolonged feast", detail: "The Easter Octave is the most solemn in the Church's calendar — every day is celebrated as Easter Sunday itself. The practice of an octave dates to the earliest centuries of Christianity.", attr: "Roman Rite", seasons: ["Eastertide"] },
  { cat: "Theology", q: "What did Christ tell St. Faustina about Divine Mercy Sunday?", a: "That He wished a feast on the first Sunday after Easter, promising that whoever received Communion on that day would receive complete forgiveness of sins and punishment", detail: "The devotion to Divine Mercy was revealed to St. Faustina Kowalska in Poland in the 1930s. Pope John Paul II officially established Divine Mercy Sunday for the universal Church in 2000.", attr: "Diary of St. Faustina", seasons: ["Eastertide"] },

  // Pentecost
  { cat: "Theology", q: "What is the gift the Holy Spirit pours into the soul at Baptism and Confirmation?", a: "Sanctifying grace — and the seven gifts of the Holy Spirit", detail: "The seven gifts are: Wisdom, Understanding, Counsel, Fortitude, Knowledge, Piety, and Fear of the Lord (Is 11:2–3). They perfect the theological and cardinal virtues.", attr: "CCC 1830–1831", seasons: ["Pentecost"] },
  { cat: "History", q: "What feast follows Pentecost in the traditional calendar, celebrating the mystery of the Trinity?", a: "Trinity Sunday — the First Sunday after Pentecost", detail: "Trinity Sunday was established by Pope John XXII for the universal Church in 1334, though it had been celebrated locally in the West since the 10th century.", attr: "Roman Rite", seasons: ["Pentecost","After Pentecost"] },
  { cat: "Liturgy", q: "What is the 'Sequence' at Pentecost?", a: "The Veni Sancte Spiritus ('Come, Holy Spirit') — one of the most beautiful hymns in the Roman Rite", detail: "The Sequence is a poetic hymn sung before the Gospel on major feasts. Pentecost's Veni Sancte Spiritus is attributed to Stephen Langton or Pope Innocent III (13th century).", attr: "Pentecost Liturgy", seasons: ["Pentecost"] },
];

// Deterministic daily trivia: pick by day-of-year
  { cat: "History", q: "Which pope declared the dogma of the Immaculate Conception in 1854?", a: "Pope Pius IX", detail: "With the bull Ineffabilis Deus, Pius IX defined that the Blessed Virgin Mary was preserved from original sin from the first moment of her conception.", attr: "Ineffabilis Deus (1854)", seasons: [] },
  { cat: "History", q: "What year did the Great Schism split Eastern and Western Christianity?", a: "1054 AD", detail: "Cardinal Humbert placed a bull of excommunication on the altar of Hagia Sophia on July 16, 1054, formalizing the split between Rome and Constantinople.", attr: "Church History", seasons: [] },
  { cat: "History", q: "Which ecumenical council defined the canon of Sacred Scripture?", a: "Council of Trent (1546)", detail: "Session IV of the Council of Trent formally defined the 73-book canon of Scripture, including the deuterocanonical books rejected by Protestants.", attr: "Council of Trent", seasons: [] },
  { cat: "History", q: "What was the name of the edict that granted Christians legal status in the Roman Empire?", a: "Edict of Milan (313 AD)", detail: "Emperors Constantine I and Licinius issued the Edict of Milan, granting freedom of worship throughout the empire and ending the persecutions.", attr: "Church History", seasons: [] },
  { cat: "History", q: "In what century did St. Benedict write his famous Rule for monasteries?", a: "6th century (c. 530 AD)", detail: "The Rule of St. Benedict, written around 530 AD at Monte Cassino, became the foundation of Western monasticism and is still followed by Benedictines today.", attr: "Rule of St. Benedict", seasons: [] },
  { cat: "History", q: "Which pope called the Second Vatican Council?", a: "Pope John XXIII", detail: "Pope John XXIII announced Vatican II on January 25, 1959. It opened in October 1962, though he died in June 1963 before its conclusion; Paul VI presided over its remaining sessions.", attr: "Vatican II", seasons: [] },
  { cat: "History", q: "What ancient city was the seat of St. Augustine of Hippo?", a: "Hippo Regius (modern Algeria)", detail: "Augustine served as Bishop of Hippo Regius in North Africa from 395 until his death in 430 AD as the Vandals besieged the city.", attr: "Life of St. Augustine", seasons: [] },
  { cat: "History", q: "Which pope defined papal infallibility as a dogma?", a: "Pope Pius IX at Vatican I (1870)", detail: "The First Vatican Council defined papal infallibility in Pastor Aeternus (1870): the pope speaks infallibly ex cathedra on faith and morals.", attr: "Pastor Aeternus (1870)", seasons: [] },
  { cat: "History", q: "What order did St. Dominic found to combat the Albigensian heresy?", a: "The Order of Preachers (Dominicans)", detail: "Dominic de Guzmán founded the Order of Preachers c. 1216, emphasizing preaching, study, and poverty to counter the Cathar heresy in southern France.", attr: "Dominican Order", seasons: [] },
  { cat: "History", q: "In what year did Pope Urban II preach the First Crusade?", a: "1095 AD at the Council of Clermont", detail: "On November 27, 1095, Urban II called upon Christians to liberate Jerusalem, launching the First Crusade and the era of crusading.", attr: "Church History", seasons: [] },
  { cat: "History", q: "Which empress called the Second Council of Nicaea (787), restoring veneration of icons?", a: "Empress Irene of Byzantium", detail: "Irene acted as regent for her son Constantine VI and convened the Seventh Ecumenical Council, which condemned iconoclasm and restored the veneration of sacred images.", attr: "Second Council of Nicaea", seasons: [] },

  // ── THEOLOGY ──
  { cat: "Theology", q: "What are the three theological virtues?", a: "Faith, Hope, and Charity", detail: "St. Paul names them in 1 Corinthians 13:13: 'And now there remain faith, hope, and charity, these three: but the greatest of these is charity.' They are infused by God at Baptism.", attr: "CCC 1813", seasons: [] },
  { cat: "Theology", q: "What is the Hypostatic Union?", a: "Christ has two natures — divine and human — in one divine Person", detail: "Defined at the Council of Chalcedon (451 AD), the Hypostatic Union teaches that the Son of God assumed a full human nature while remaining fully divine, two natures without confusion or separation.", attr: "Council of Chalcedon (451)", seasons: [] },
  { cat: "Theology", q: "According to St. Thomas Aquinas, what is the definition of law?", a: "An ordinance of reason for the common good, made by one who has care of the community, and promulgated", detail: "Thomas defines law in the Summa Theologiae (I-II, Q.90): it must be rational, directed to the common good, made by legitimate authority, and made known through promulgation.", attr: "Summa Theologiae I-II, Q.90", seasons: [] },
  { cat: "Theology", q: "What are the four marks of the Church?", a: "One, Holy, Catholic, and Apostolic", detail: "These four marks, professed in the Nicene Creed, describe the essential characteristics of the Church Christ founded.", attr: "CCC 811", seasons: [] },
  { cat: "Theology", q: "What is the difference between mortal and venial sin?", a: "Mortal sin destroys charity; venial sin weakens but does not sever the soul's union with God", detail: "A mortal sin requires: (1) grave matter, (2) full knowledge, and (3) deliberate consent. Without these three, the sin is venial.", attr: "CCC 1857–1862", seasons: [] },
  { cat: "Theology", q: "What does the Church teach about the Real Presence in the Eucharist?", a: "Christ is truly, really, and substantially present — Body, Blood, Soul, and Divinity", detail: "The Council of Trent defined transubstantiation: the entire substance of bread and wine is converted into the Body and Blood of Christ, while the appearances remain.", attr: "Council of Trent, Session XIII", seasons: [] },
  { cat: "Theology", q: "What is the Beatific Vision?", a: "The direct, unmediated vision of God enjoyed by the saints in heaven", detail: "The Beatific Vision is the ultimate end of man — seeing God face to face (1 Cor 13:12). It is supernatural, beyond any natural capacity, and is the source of perfect happiness.", attr: "CCC 1023–1026", seasons: [] },
  { cat: "Theology", q: "What is the 'sensus fidei'?", a: "The supernatural instinct of the faithful for recognizing truths of the faith", detail: "The sensus fidei (sense of the faith) is a gift of the Holy Spirit by which the whole body of the faithful cannot err in matters of belief.", attr: "Lumen Gentium 12", seasons: [] },
  { cat: "Theology", q: "How many sacraments does the Catholic Church have, and who defined this number?", a: "Seven, defined at the Council of Florence (1439) and reaffirmed at Trent", detail: "Baptism, Confirmation, Eucharist, Penance, Anointing of the Sick, Holy Orders, and Matrimony. The Council of Trent (Session VII, 1547) solemnly defined seven against Protestant reductions.", attr: "Council of Trent, Session VII", seasons: [] },
  { cat: "Theology", q: "What is the doctrine of Original Sin?", a: "The sin of Adam, transmitted to all humanity, depriving us of sanctifying grace and wounding human nature", detail: "Defined at the Council of Trent, original sin is not a personal act but a state of deprivation inherited from Adam. It is remitted by Baptism.", attr: "CCC 402–406", seasons: [] },
  { cat: "Theology", q: "What does 'ex opere operato' mean in sacramental theology?", a: "Sacraments confer grace by the performance of the sacramental act itself, not by the merit of the minister", detail: "The term means 'from the work performed.' The sacrament's efficacy depends on Christ acting through the Church, not on the holiness of the priest or recipient (though the recipient's dispositions affect the fruit received).", attr: "CCC 1128", seasons: [] },

  // ── LITURGY ──
  { cat: "Liturgy", q: "What are the five parts of the Ordinary of the Mass?", a: "Kyrie, Gloria, Credo, Sanctus, and Agnus Dei", detail: "These fixed texts recur at every Mass (except the Gloria and Credo are omitted on certain days). They give the Mass its enduring structure regardless of the feast.", attr: "Roman Rite", seasons: [] },
  { cat: "Liturgy", q: "What liturgical color is worn during Advent and Lent?", a: "Violet (purple)", detail: "Violet signifies penance, preparation, and longing. Rose may be worn on Gaudete Sunday (Advent III) and Laetare Sunday (Lent IV), expressing mid-season joy.", attr: "Roman Rite", seasons: ["Advent","Lent"] },
  { cat: "Liturgy", q: "What is the Introit?", a: "The entrance antiphon sung at the beginning of Mass", detail: "The Introit is the first chant of the Proper of the Mass, sung as the priest approaches the altar. Its text, drawn from Scripture, sets the spiritual tone of each feast.", attr: "Roman Rite", seasons: [] },
  { cat: "Liturgy", q: "What does 'Ordinary Form' and 'Extraordinary Form' refer to?", a: "Two forms of the Roman Rite: the 1970 Missal (OF) and the 1962 Missal (EF/Traditional Latin Mass)", detail: "Benedict XVI in Summorum Pontificum (2007) designated these two forms of one Roman Rite, allowing the Traditional Latin Mass to be celebrated more widely.", attr: "Summorum Pontificum (2007)", seasons: [] },
  { cat: "Liturgy", q: "What is 'ad orientem' worship?", a: "Celebrating Mass with the priest and people facing the same direction — liturgical East — toward God", detail: "Historically, both priest and faithful faced East (or the liturgical East), symbolizing the eschatological expectation of Christ's return. It was standard before the post-Vatican II reform of altar orientation.", attr: "Liturgical Tradition", seasons: [] },
  { cat: "Liturgy", q: "What is the Liturgy of the Hours?", a: "The daily prayer of the Church, sanctifying the hours of the day — from Lauds to Compline", detail: "The Divine Office (CCC 1174–1178) extends the Eucharist's praise through the day: Lauds (morning), Terce, Sext, None, Vespers (evening), Compline (night), and the Office of Readings.", attr: "CCC 1174–1178", seasons: [] },
  { cat: "Liturgy", q: "What is Septuagesima?", a: "The pre-Lenten season in the traditional calendar, beginning 70 days before Easter", detail: "Septuagesima, Sexagesima, and Quinquagesima Sundays form a three-week preparation before Ash Wednesday in the 1962 calendar. The Alleluia is omitted during this season.", attr: "1962 Roman Missal", seasons: ["Septuagesima · Pre-Lent"] },
  { cat: "Liturgy", q: "What is the significance of the Alleluia being suppressed during Lent?", a: "It symbolizes mourning and penance — the joy of the Resurrection is 'buried' until Easter", detail: "In the traditional rite, the Alleluia is ceremonially 'buried' at the end of Septuagesima/Quinquagesima. Its joyful return at the Easter Vigil marks the great night of resurrection.", attr: "Roman Rite · Lenten Tradition", seasons: ["Lent","Septuagesima · Pre-Lent"] },

  // ── ADVENT ──
  { cat: "Liturgy", q: "How many Sundays are in the season of Advent?", a: "Four Sundays", detail: "Advent spans four Sundays before Christmas. Each week increases in eschatological anticipation: the Second Coming, John the Baptist, the prophets, and the Virgin Mary's role in the Incarnation.", attr: "Roman Rite", seasons: ["Advent"] },
  { cat: "History", q: "What ancient prophecy does the Church read every Advent about a virgin bearing a son?", a: "Isaiah 7:14 — 'Behold, a virgin shall conceive and bear a son, and his name shall be called Emmanuel'", detail: "This prophecy from the 8th century BC is quoted in Matthew 1:23 as fulfilled in the Virgin Birth of Christ. It is a central text of the Advent liturgy.", attr: "Isaiah 7:14", seasons: ["Advent"] },

  // ── CHRISTMAS ──
  { cat: "Theology", q: "What does the Incarnation mean?", a: "The eternal Son of God took on human flesh and became man in the womb of the Virgin Mary", detail: "John 1:14 — 'And the Word was made flesh.' The Incarnation is not a transformation of God but an assumption of human nature: one divine Person, two natures.", attr: "CCC 461–463", seasons: ["Christmastide"] },

  // ── LENT ──
  { cat: "Theology", q: "What are the three Lenten disciplines the Church commends?", a: "Prayer, Fasting, and Almsgiving", detail: "Jesus names these in Matthew 6:1–18 as interior acts of righteousness. The Church channels them liturgically through Lent as preparation for the Paschal Mystery.", attr: "CCC 1434", seasons: ["Lent"] },
  { cat: "History", q: "When did the practice of marking foreheads with ash on Ash Wednesday originate?", a: "It developed throughout the early medieval period, with papal promulgation by the 11th century", detail: "The use of ashes as a sign of penitence is biblical (Job, Jonah). The universal Roman practice of Ash Wednesday as the formal start of Lent became widespread by the time of Gregory VII (d. 1085).", attr: "Liturgical History", seasons: ["Lent"] },

  // ── HOLY WEEK / PASSIONTIDE ──
  { cat: "Liturgy", q: "What is Tenebrae?", a: "A nocturnal Holy Week office in which candles are extinguished one by one to symbolize Christ's approaching death", detail: "Tenebrae (Latin for 'darkness') combines Matins and Lauds for Wednesday, Thursday, and Friday of Holy Week. As each candle is snuffed, the church grows dark, ending in utter darkness at Christ's death.", attr: "Holy Week Liturgy", seasons: ["Passiontide"] },
  { cat: "History", q: "What is the Mandatum, performed on Holy Thursday?", a: "The washing of feet, recalling Christ's washing of the Apostles' feet at the Last Supper (Jn 13)", detail: "The word 'Mandatum' comes from Christ's command (mandatum novum): 'A new commandment I give you, that you love one another.' The ceremony is performed after the Mass of the Lord's Supper.", attr: "Holy Thursday Liturgy", seasons: ["Passiontide"] },

  // ── EASTER ──
  { cat: "Theology", q: "What does 'Paschal Mystery' refer to?", a: "Christ's Passion, Death, Resurrection, and Ascension — through which He redeems humanity", detail: "The Paschal Mystery (CCC 571) is the center of the Christian faith. Through it, Christ passes from death to life and opens the way of salvation for all who are united to Him in Baptism.", attr: "CCC 571", seasons: ["Eastertide"] },
  { cat: "Liturgy", q: "What is the Exsultet?", a: "The ancient Easter proclamation (Praeconium Paschale) sung at the Easter Vigil, praising the Paschal candle and celebrating the Resurrection", detail: "Possibly composed in part by St. Ambrose, the Exsultet is one of the Church's oldest hymns, addressed to the bees whose wax provides the candle, to the earth, and ultimately to God for the gift of redemption.", attr: "Easter Vigil", seasons: ["Eastertide"] },

  // ── PENTECOST ──
  { cat: "Theology", q: "What is the gift the Holy Spirit pours into the soul at Baptism and Confirmation?", a: "Sanctifying grace — and the seven gifts of the Holy Spirit", detail: "The seven gifts are: Wisdom, Understanding, Counsel, Fortitude, Knowledge, Piety, and Fear of the Lord (Is 11:2–3). They perfect the theological and cardinal virtues.", attr: "CCC 1830–1831", seasons: ["Pentecost"] },
];

// Deterministic daily trivia: pick by day-of-year
function getDailyTrivia(liturgicalSeason) {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);

  // Try season-specific questions first
  const seasonQ = TRIVIA_BANK.filter(q => q.seasons.includes(liturgicalSeason));
  const allQ = TRIVIA_BANK;

  // If we have season questions, weight toward them (first half of candidates)
  const pool = seasonQ.length >= 3
    ? [...seasonQ, ...seasonQ, ...allQ]  // double-weight season questions
    : allQ;

  return pool[dayOfYear % pool.length];
}

// ═══════════════════════════════════════════════════════════════════
// TODAY TAB — Liturgical calendar, readings, saint, reflection
// ═══════════════════════════════════════════════════════════════════
function TodayTab() {
  const today = new Date();
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dateStr = `${days[today.getDay()]} · ${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
  const [showOF, setShowOF] = useState(false);
  const [showReadings, setShowReadings] = useState(false);
  const [triviaRevealed, setTriviaRevealed] = useState(false);
  const [reminders] = useState(() => {
    try {
      const stored = localStorage.getItem("custos_reminders");
      return stored ? JSON.parse(stored) : { prayer: false, confession: false, stations: false };
    } catch { return { prayer: false, confession: false, stations: false }; }
  });

  const lit = getLiturgicalDay(today);
  const colorDot = COLOR_HEX[lit.color] || COLOR_HEX.green;

  let readings = EF_READINGS[lit.title] || (lit.fixedFeast && EF_READINGS[lit.fixedFeast]) || null;
  let readingsFrom = null;
  if (!readings && today.getDay() !== 0) {
    const daysBack = today.getDay();
    const prevSun = new Date(today);
    prevSun.setDate(prevSun.getDate() - daysBack);
    const prevLit = getLiturgicalDay(prevSun);
    readings = EF_READINGS[prevLit.title] || null;
    if (readings) readingsFrom = prevLit.title;
  }

  const reflections = {
    "Christmastide": { cite: "Jn 1:14", text: "And the Word was made flesh, and dwelt among us, and we saw His glory, the glory as of the only begotten of the Father, full of grace and truth.", saint: "St. Athanasius", sq: "He became man that we might become God.", ss: "On the Incarnation" },
    "After Epiphany": { cite: "Mt 2:11", text: "And falling down they adored Him; and opening their treasures, they offered Him gifts: gold, frankincense, and myrrh.", saint: "St. Leo the Great", sq: "Recognize, O Christian, your dignity, and having been made a partaker of the divine nature, do not return to the baseness of former ways.", ss: "Sermon 21" },
    "Septuagesima · Pre-Lent": { cite: "1 Cor 9:24", text: "Know you not that they that run in the race, all run indeed, but one receiveth the prize? So run that you may obtain.", saint: "St. Augustine", sq: "Late have I loved Thee, O Beauty ever ancient, ever new! Late have I loved Thee!", ss: "Confessions · Book X" },
    "Lent": { cite: "Joel 2:12\u201313", text: "Be converted to Me with all your heart, in fasting, and in weeping, and in mourning. And rend your hearts and not your garments.", saint: "St. Alphonsus Liguori", sq: "He who trusts himself is lost. He who trusts in God can do all things.", ss: "The Practice of the Love of Jesus Christ" },
    "Passiontide": { cite: "Is 53:5", text: "He was wounded for our iniquities, He was bruised for our sins: the chastisement of our peace was upon Him, and by His bruises we are healed.", saint: "St. Catherine of Siena", sq: "Nails were not enough to hold God-and-man nailed and fastened on the Cross, had not love held Him there.", ss: "Dialogue" },
    "Eastertide": { cite: "Rom 6:9", text: "Christ rising again from the dead, dieth now no more, death shall no more have dominion over Him.", saint: "St. Augustine", sq: "We are an Easter people and Alleluia is our song.", ss: "In Psalmum" },
    "Pentecost": { cite: "Acts 2:4", text: "And they were all filled with the Holy Ghost, and they began to speak with divers tongues, according as the Holy Ghost gave them to speak.", saint: "St. Thomas Aquinas", sq: "The Holy Spirit is the Love that unites the Father and the Son.", ss: "Summa I, Q.37" },
    "After Pentecost": { cite: "Rom 8:28", text: "We know that to them that love God, all things work together unto good, to such as are called according to His purpose.", saint: "St. Francis de Sales", sq: "Have patience with all things, but chiefly have patience with yourself.", ss: "Introduction to the Devout Life" },
    "Advent": { cite: "Is 40:3", text: "The voice of one crying in the desert: Prepare ye the way of the Lord, make straight in the wilderness the paths of our God.", saint: "St. Bernard of Clairvaux", sq: "In the fullness of time, the fullness of the Godhead came. It came in the flesh so that flesh could see it.", ss: "Sermon on the Advent" },
  };
  const ref = reflections[lit.season] || reflections["After Pentecost"];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <TopBar title="Today" showBack={false} />
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 8 }}>
        <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(11), fontWeight: 600, color: T.inkLight, letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "center", padding: "18px 20px 0" }}>{dateStr}</div>

        {/* Reminder banners */}
        {(reminders.prayer || reminders.confession || reminders.stations) && (
          <div style={{ margin: "10px 20px 0", display: "flex", flexDirection: "column", gap: 6 }}>
            {reminders.prayer && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: T.goldFaint, border: `1px solid ${T.cardBorderStrong}`, borderRadius: 10 }}>
                <span style={{ fontSize: fz(16) }}>🙏</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 700, color: T.gold, letterSpacing: "0.06em", textTransform: "uppercase" }}>Morning Prayer</div>
                  <div style={{ fontFamily: "EB Garamond, serif", fontSize: fz(13.5), color: T.inkMid, fontStyle: "italic" }}>Have you prayed your morning offering today?</div>
                </div>
              </div>
            )}
            {reminders.confession && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "rgba(122,28,28,0.05)", border: `1px solid rgba(122,28,28,0.15)`, borderRadius: 10 }}>
                <span style={{ fontSize: fz(16) }}>⚖</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 700, color: T.crimson, letterSpacing: "0.06em", textTransform: "uppercase" }}>Confession</div>
                  <div style={{ fontFamily: "EB Garamond, serif", fontSize: fz(13.5), color: T.inkMid, fontStyle: "italic" }}>When did you last receive the Sacrament of Penance?</div>
                </div>
              </div>
            )}
            {reminders.stations && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "rgba(26,39,68,0.05)", border: `1px solid rgba(26,39,68,0.12)`, borderRadius: 10 }}>
                <span style={{ fontSize: fz(16) }}>✝</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 700, color: T.navyText, letterSpacing: "0.06em", textTransform: "uppercase" }}>Stations of the Cross</div>
                  <div style={{ fontFamily: "EB Garamond, serif", fontSize: fz(13.5), color: T.inkMid, fontStyle: "italic" }}>Walk the Via Crucis with Christ today.</div>
                </div>
              </div>
            )}
          </div>
        )}
        <Card style={{ margin: "12px 20px 0", cursor: readings ? "pointer" : "default" }}>
          <div onClick={() => { if (readings) setShowReadings(!showReadings); }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 700, color: T.gold, letterSpacing: "0.06em", textTransform: "uppercase", padding: "3px 10px", border: `1px solid ${T.gold}`, borderRadius: 12 }}>Extraordinary Form · 1962 Missal</span>
              {readings && <span style={{ fontFamily: "EB Garamond, serif", fontSize: fz(12), color: T.inkLight }}>{showReadings ? "▾" : "Tap for Propers ›"}</span>}
            </div>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(11), fontWeight: 600, color: T.crimson, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 2 }}>{lit.season}</div>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(20), fontWeight: 500, color: T.inkDark, marginBottom: 2 }}>{lit.title}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: colorDot, border: "1px solid rgba(0,0,0,0.15)" }} />
              <span style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 700, color: T.inkMid, letterSpacing: "0.05em", textTransform: "uppercase" }}>{lit.rank} · {COLOR_NAMES[lit.color] || lit.color}</span>
            </div>
            {lit.fixedFeast && <div style={{ fontFamily: "EB Garamond, serif", fontSize: fz(14), fontStyle: "italic", color: T.gold }}>{lit.fixedFeast}</div>}
          </div>
          {showReadings && readings && (
            <div style={{ marginTop: 14 }}>
              <div style={{ height: 1, background: "rgba(212,168,67,0.2)", marginBottom: 14 }} />
              {readingsFrom && <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 600, color: T.gold, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Mass of {readingsFrom}</div>}
              <div style={{ borderLeft: `3px solid ${T.crimson}`, paddingLeft: 14, marginBottom: 16 }}>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 700, color: T.crimson, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>Epistle · {readings.e.r}</div>
                <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(16), fontStyle: "italic", color: T.inkDark, lineHeight: 1.65, margin: 0 }}>{readings.e.t}</p>
                {resolveSourceUrl(readings.e.r) && <a href={resolveSourceUrl(readings.e.r)} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8, fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 600, color: T.gold, textDecoration: "none", letterSpacing: "0.04em", padding: "3px 10px", background: T.goldFaint, border: `1px solid ${T.cardBorderStrong}`, borderRadius: 12 }}>📖 Read Full Text</a>}
              </div>
              <div style={{ borderLeft: `3px solid ${T.navyText}`, paddingLeft: 14 }}>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 700, color: T.navyText, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>Gospel · {readings.g.r}</div>
                <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(16), fontStyle: "italic", color: T.inkDark, lineHeight: 1.65, margin: 0 }}>{readings.g.t}</p>
                {resolveSourceUrl(readings.g.r) && <a href={resolveSourceUrl(readings.g.r)} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8, fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 600, color: T.gold, textDecoration: "none", letterSpacing: "0.04em", padding: "3px 10px", background: T.goldFaint, border: `1px solid ${T.cardBorderStrong}`, borderRadius: 12 }}>📖 Read Full Text</a>}
              </div>
              <div style={{ fontFamily: "EB Garamond, serif", fontSize: fz(12), fontStyle: "italic", color: T.inkLight, marginTop: 12, textAlign: "center" }}>Douay-Rheims translation</div>
            </div>
          )}
          <div style={{ height: 1, background: "rgba(212,168,67,0.2)", margin: "14px 0 10px" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 600, color: T.inkLight, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 2 }}>Ordinary Form</div>
              <div style={{ fontFamily: "EB Garamond, serif", fontSize: fz(15), color: T.inkDark }}>{lit.ofTitle}</div>
              {showOF && lit.ofFeast && <div style={{ fontFamily: "EB Garamond, serif", fontSize: fz(13), fontStyle: "italic", color: T.gold }}>{lit.ofFeast}</div>}
            </div>
            {lit.ofFeast && <button onClick={() => setShowOF(!showOF)} style={{ fontFamily: "EB Garamond, serif", fontSize: fz(12), color: T.inkLight, background: "none", border: "none", cursor: "pointer" }}>{showOF ? "Hide" : "Show"}</button>}
          </div>
        </Card>

        {/* Reflection */}
        <Card style={{ margin: "12px 20px 0" }}>
          <CardTitle color={T.crimson}>Today's Reflection · {lit.season}</CardTitle>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <span style={{ fontFamily: "Cinzel, serif", fontSize: fz(11), fontWeight: 600, color: T.crimson, letterSpacing: "0.04em", textTransform: "uppercase", padding: "3px 10px", background: "rgba(122,28,28,0.05)", borderRadius: 6 }}>{lit.title}</span>
            <span style={{ fontFamily: "EB Garamond, serif", fontSize: fz(13), fontStyle: "italic", color: T.inkLight }}>{ref.cite}</span>
          </div>
          <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(17), fontStyle: "italic", color: T.inkDark, lineHeight: 1.6, margin: "0 0 16px" }}>"{ref.text}"</p>
          <SaintQuote name={ref.saint} quote={ref.sq} source={ref.ss} isExact={true} />
        </Card>

        {/* Saint of the Day */}
        {(() => {
          const saint = getSaintOfDay(today);
          return (
            <Card style={{ margin: "12px 20px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: T.goldFaint, display: "flex", alignItems: "center", justifyContent: "center", fontSize: fz(22), border: `1.5px solid ${T.cardBorderStrong}` }}>{saint.icon}</div>
                <div style={{ flex: 1 }}><CardTitle>Saint of the Day</CardTitle><div style={{ fontFamily: "Cinzel, serif", fontSize: fz(16), fontWeight: 500, color: T.inkDark }}>{saint.n}</div></div>
              </div>
              <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(15.5), color: T.inkMid, lineHeight: 1.6, margin: 0 }}>{saint.bio}</p>
            </Card>
          );
        })()}

        {/* Daily Catholic Trivia */}
        {(() => {
          const trivia = getDailyTrivia(lit.season);
          const CAT_COLORS = { History: T.navy, Theology: T.crimson, Liturgy: "#5a7a2a" };
          const CAT_ICONS = { History: "📜", Theology: "✝", Liturgy: "🕯" };
          const catColor = CAT_COLORS[trivia.cat] || T.navy;
          return (
            <Card style={{ margin: "12px 20px 8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: fz(18) }}>{CAT_ICONS[trivia.cat] || "❓"}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(9), fontWeight: 700, color: T.gold, letterSpacing: "0.10em", textTransform: "uppercase" }}>Daily Trivia</div>
                  <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(9), fontWeight: 600, color: catColor, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.85 }}>{trivia.cat}</div>
                </div>
              </div>

              <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(16.5), color: T.inkDark, lineHeight: 1.55, margin: "0 0 14px", fontStyle: "italic" }}>{trivia.q}</p>

              {!triviaRevealed ? (
                <button
                  onClick={() => setTriviaRevealed(true)}
                  style={{
                    width: "100%", padding: "10px 16px",
                    fontFamily: "Cinzel, serif", fontSize: fz(12), fontWeight: 600,
                    letterSpacing: "0.06em", textTransform: "uppercase",
                    color: T.warmWhite, background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`,
                    border: "none", borderRadius: 10, cursor: "pointer",
                  }}
                >Reveal Answer</button>
              ) : (
                <div style={{ borderTop: `1px solid ${T.cardBorder}`, paddingTop: 12 }}>
                  <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 700, color: catColor, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>Answer</div>
                  <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(16), fontWeight: 600, color: T.inkDark, lineHeight: 1.5, margin: "0 0 10px" }}>{trivia.a}</p>
                  <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(14.5), color: T.inkMid, lineHeight: 1.55, margin: "0 0 10px" }}>{trivia.detail}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 3, height: 3, borderRadius: "50%", background: T.gold }} />
                    <span style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), color: T.inkLight, letterSpacing: "0.04em" }}>{trivia.attr}</span>
                  </div>
                </div>
              )}
            </Card>
          );
        })()}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PRAY HUB — Gateway to all devotional features
// ═══════════════════════════════════════════════════════════════════
function PrayHub({ onTab }) {
  const items = [
    { id: "examen", icon: "🕯", title: "Daily Examen", desc: "Ignatian five-movement prayer to review your day with God", bg: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})` },
    { id: "rosary", icon: "📿", title: "Holy Rosary", desc: "Joyful · Sorrowful · Glorious mysteries, bead by bead", bg: `linear-gradient(135deg, ${T.crimson}, ${T.crimsonLight})` },
    { id: "stations", icon: "✝", title: "Stations of the Cross", desc: "Via Crucis — three devotional versions with illustrations", bg: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})` },
    { id: "confession", icon: "⚖", title: "Confession Preparation", desc: "Examination of conscience by the Ten Commandments", bg: `linear-gradient(135deg, ${T.crimson}, ${T.crimsonLight})` },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <TopBar title="Pray" showBack={false} />
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "Cinzel, serif", fontSize: fz(22), fontWeight: 500, color: T.inkDark, margin: "0 0 4px" }}>The Devotional Life</h2>
          <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(15), fontStyle: "italic", color: T.inkLight, margin: 0 }}>Prayer, penance, and the sacraments</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map(item => (
            <button key={item.id} onClick={() => onTab(item.id)} style={{
              display: "flex", alignItems: "center", gap: 14, width: "100%",
              padding: "16px", background: item.bg,
              border: "none", borderRadius: 12, cursor: "pointer", textAlign: "left",
            }}>
              <div style={{ width: 46, height: 46, borderRadius: "50%", background: "rgba(212,168,67,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{item.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(14), fontWeight: 600, color: "#d4a843", letterSpacing: "0.04em", textTransform: "uppercase" }}>{item.title}</div>
                <div style={{ fontFamily: "EB Garamond, serif", fontSize: fz(13), color: "rgba(245,240,232,0.7)", fontStyle: "italic", marginTop: 2 }}>{item.desc}</div>
              </div>
              <span style={{ color: T.gold, fontSize: 18 }}>›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
export default function Custos() {
  const [tab, setTab] = useState("landing");
  const [seekStartView, setSeekStartView] = useState(null); // null or "privacy" or "sources"
  const [dark, setDark] = useState(false);
  const [fszGlobal, setFszGlobal] = useState(1); // 0=small, 1=medium, 2=large

  // Update mutable theme & font scale before render
  Object.assign(T, dark ? DARK : LIGHT);
  const FSCALES = [0.88, 1, 1.14];
  const FLABELS = ["A⁻", "A", "A⁺"];
  fontScale = FSCALES[fszGlobal];

  // Scroll to top on every tab change
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    // Also reset any scrollable child containers
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.querySelectorAll('[style*="overflow"]').forEach(el => { el.scrollTop = 0; });
    });
  }, [tab]);

  const navTab = (tab === "confession" || tab === "stations" || tab === "rosary" || tab === "examen") ? "pray"
    : tab === "settings" ? "seek" : tab === "landing" ? "landing" : tab;

  const isDesktop = typeof window !== 'undefined' && window.innerWidth > 640;

  return (
    <div style={{
      width: "100%", maxWidth: isDesktop ? 780 : 430, margin: "0 auto",
      minHeight: "100vh", background: T.parchment,
      fontFamily: "EB Garamond, serif",
      display: "flex", flexDirection: "column",
      transition: "background 0.4s ease",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap');
        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        body { margin: 0; padding: 0; background: ${T.parchment}; transition: background 0.4s ease; }
        input:focus, textarea:focus { outline: none; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
      `}</style>

      {/* ═══ LANDING PAGE ═══ */}
      {tab === "landing" && (
        <div style={{ flex: 1, overflowY: "auto" }}>
          {/* Hero */}
          <div style={{ background: `linear-gradient(175deg, ${T.navy} 0%, #243456 55%, ${T.crimson} 200%)`, padding: "60px 24px 50px", textAlign: "center", position: "relative" }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: "50%", background: "rgba(212,168,67,0.12)", border: "2px solid rgba(212,168,67,0.25)", marginBottom: 16 }}>
              <svg width="40" height="40" viewBox="0 0 512 512" fill="none">
                <path d="M220 270 C195 250,150 210,100 175 C75 160,55 165,52 180 C48 200,65 225,95 245 C130 268,180 275,220 270Z" fill="#d4a843" opacity="0.5"/>
                <path d="M292 270 C317 250,362 210,412 175 C437 160,457 165,460 180 C464 200,447 225,417 245 C382 268,332 275,292 270Z" fill="#d4a843" opacity="0.5"/>
                <ellipse cx="256" cy="160" rx="48" ry="14" fill="none" stroke="#d4a843" strokeWidth="8" opacity="0.65"/>
                <circle cx="256" cy="198" r="35" fill="#d4a843" opacity="0.18" stroke="#d4a843" strokeWidth="6" strokeOpacity="0.55"/>
                <path d="M224 230 L210 390 C210 403,222 412,238 412 L274 412 C290 412,302 403,302 390 L288 230 C276 248,236 248,224 230Z" fill="#1a2744" opacity="0.85"/>
                <line x1="256" y1="275" x2="256" y2="325" stroke="#d4a843" strokeWidth="7" opacity="0.7" strokeLinecap="round"/>
                <line x1="242" y1="290" x2="270" y2="290" stroke="#d4a843" strokeWidth="7" opacity="0.7" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 style={{ fontFamily: "Cinzel, serif", fontSize: fz(36), fontWeight: 400, letterSpacing: "0.14em", color: "#fff", textTransform: "uppercase", margin: "0 0 6px" }}>Custos</h1>
            <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(17), color: T.gold, fontStyle: "italic", margin: "0 0 20px" }}>A guardian for your conscience</p>
            <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(18), color: "rgba(255,255,255,0.8)", maxWidth: 400, margin: "0 auto 28px", lineHeight: 1.55 }}>When you need the Church's wisdom, not the world's opinion</p>
            <button onClick={() => setTab("seek")} style={{ padding: "14px 44px", fontFamily: "Cinzel, serif", fontSize: fz(13), fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: T.navy, background: "linear-gradient(135deg, #d4a843, #e8c06a)", border: "none", borderRadius: 12, cursor: "pointer", boxShadow: "0 4px 20px rgba(212,168,67,0.35)" }}>Ask Your Question</button>
          </div>

          {/* How it works */}
          <div style={{ padding: "40px 20px 30px" }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 700, color: T.gold, letterSpacing: "0.12em", textTransform: "uppercase", textAlign: "center", marginBottom: 6 }}>How it works</div>
            <h2 style={{ fontFamily: "Cinzel, serif", fontSize: fz(22), fontWeight: 500, color: T.navyText, textAlign: "center", marginBottom: 20 }}>Three Steps to Clarity</h2>
            {[
              { num: "I", title: "Ask", desc: "Describe your moral question, dilemma, or situation in your own words." },
              { num: "II", title: "Receive", desc: "Get structured guidance: the answer, the reasoning, the sources, and the certainty level." },
              { num: "III", title: "Verify", desc: "Every citation links to the full original text. Read it yourself. Then bring it to your confessor." },
            ].map((step, i) => (
              <Card key={i} style={{ marginBottom: 10, textAlign: "center" }}>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(22), fontWeight: 700, color: T.gold, marginBottom: 4 }}>{step.num}</div>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(12), fontWeight: 600, color: T.navyText, letterSpacing: "0.04em", marginBottom: 4 }}>{step.title}</div>
                <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(15), color: T.inkMid, lineHeight: 1.5, margin: 0 }}>{step.desc}</p>
              </Card>
            ))}
          </div>

          {/* Why Custos */}
          <div style={{ padding: "10px 20px 30px" }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 700, color: T.gold, letterSpacing: "0.12em", textTransform: "uppercase", textAlign: "center", marginBottom: 6 }}>Why Custos</div>
            <h2 style={{ fontFamily: "Cinzel, serif", fontSize: fz(22), fontWeight: 500, color: T.navyText, textAlign: "center", marginBottom: 20 }}>Not Just the Rule — the Reason</h2>
            {[
              { icon: "📖", title: "Closed Universe", desc: "Only named, approved sources. No blogs, no unnamed scholars. You always know where the teaching comes from." },
              { icon: "⚖", title: "Calibrated Certainty", desc: "Every response states whether the teaching is definitive, authoritative, addressed but not resolved, or not addressed." },
              { icon: "🔗", title: "Linked Primary Sources", desc: "Every citation links directly to the full text online. Verify everything." },
              { icon: "🔒", title: "Private by Architecture", desc: "No accounts. No login. No stored questions. Your questions are processed and immediately forgotten." },
            ].map((item, i) => (
              <Card key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(12), fontWeight: 600, color: T.navyText, letterSpacing: "0.04em" }}>{item.title}</div>
                </div>
                <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(15), color: T.inkMid, lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
              </Card>
            ))}
          </div>

          {/* Devotional Features */}
          <div style={{ padding: "10px 20px 30px" }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 700, color: T.gold, letterSpacing: "0.12em", textTransform: "uppercase", textAlign: "center", marginBottom: 6 }}>More than guidance</div>
            <h2 style={{ fontFamily: "Cinzel, serif", fontSize: fz(22), fontWeight: 500, color: T.navyText, textAlign: "center", marginBottom: 20 }}>A Complete Devotional Companion</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { icon: "🙏", title: "Holy Rosary", desc: "Three mystery sets with Tissot paintings" },
                { icon: "✝", title: "Stations", desc: "14 stations with master artwork" },
                { icon: "🕯", title: "Daily Examen", desc: "Guided five-step evening prayer" },
                { icon: "⛪", title: "Confession", desc: "Private examination of conscience" },
                { icon: "📅", title: "Calendar", desc: "Traditional liturgical calendar" },
                { icon: "🏛", title: "15 Doctors", desc: "Bios, quotes, and linked works" },
              ].map((f, i) => (
                <Card key={i} style={{ textAlign: "center", padding: "14px 12px" }}>
                  <span style={{ fontSize: 20 }}>{f.icon}</span>
                  <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(11), fontWeight: 600, color: T.navyText, letterSpacing: "0.03em", marginTop: 4, marginBottom: 2 }}>{f.title}</div>
                  <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(13), color: T.inkLight, lineHeight: 1.4, margin: 0 }}>{f.desc}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Sources */}
          <div style={{ background: T.navy, padding: "40px 20px", margin: "0 -0px" }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 700, color: T.gold, letterSpacing: "0.12em", textTransform: "uppercase", textAlign: "center", marginBottom: 6 }}>The Closed Universe</div>
            <h2 style={{ fontFamily: "Cinzel, serif", fontSize: fz(22), fontWeight: 500, color: "#fff", textAlign: "center", marginBottom: 20 }}>56 Approved Sources. Nothing Else.</h2>
            {[
              { icon: "📜", title: "Sacred Scripture", desc: "Douay-Rheims only" },
              { icon: "📕", title: "Catechisms", desc: "Baltimore, Roman, Pius X" },
              { icon: "⛪", title: "4 Church Councils", desc: "Lateran IV, Florence, Trent, Vatican I" },
              { icon: "✉", title: "21 Encyclicals & 4 Motu Proprio", desc: "Gregory XVI through Benedict XVI" },
              { icon: "📋", title: "5 CDF Instructions", desc: "3 in forma specifica · 2 in common form" },
              { icon: "🏛", title: "15 Doctors", desc: "Aquinas, Augustine, Bellarmine, and more" },
              { icon: "⚖", title: "Canon Law", desc: "1917 and 1983 Codes, side by side" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(212,168,67,0.15)", borderRadius: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{s.icon}</span>
                <div>
                  <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(12), fontWeight: 600, color: T.gold, letterSpacing: "0.03em" }}>{s.title}</div>
                  <div style={{ fontFamily: "EB Garamond, serif", fontSize: fz(13), color: "rgba(255,255,255,0.6)", lineHeight: 1.4 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Privacy */}
          <div style={{ padding: "30px 20px", background: T.warmWhite, borderTop: `1px solid ${T.cardBorder}` }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 700, color: T.gold, letterSpacing: "0.12em", textTransform: "uppercase", textAlign: "center", marginBottom: 6 }}>Your Privacy</div>
            <h2 style={{ fontFamily: "Cinzel, serif", fontSize: fz(22), fontWeight: 500, color: T.navyText, textAlign: "center", marginBottom: 20 }}>Built to Forget</h2>
            <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center", gap: 12 }}>
              {[
                { icon: "🔒", title: "No Accounts", desc: "No login required" },
                { icon: "🗑", title: "No Storage", desc: "Questions immediately discarded" },
                { icon: "👁‍🗨", title: "No Tracking", desc: "No cookies or analytics" },
              ].map((p, i) => (
                <div key={i} style={{ flex: 1 }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{p.icon}</div>
                  <div style={{ fontFamily: "Cinzel, serif", fontSize: fz(10), fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: T.navyText, marginBottom: 2 }}>{p.title}</div>
                  <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(13), color: T.inkLight, margin: 0 }}>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div style={{ padding: "40px 24px 50px", textAlign: "center", background: T.parchment }}>
            <h2 style={{ fontFamily: "Cinzel, serif", fontSize: fz(24), fontWeight: 500, color: T.navyText, marginBottom: 10 }}>Ask Your First Question</h2>
            <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(16), color: T.inkMid, marginBottom: 24 }}>Free. Private. Faithful to the Tradition.</p>
            <button onClick={() => setTab("seek")} style={{ padding: "14px 44px", fontFamily: "Cinzel, serif", fontSize: fz(13), fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: T.navy, background: "linear-gradient(135deg, #d4a843, #e8c06a)", border: "none", borderRadius: 12, cursor: "pointer", boxShadow: "0 4px 20px rgba(212,168,67,0.35)" }}>Seek Guidance</button>
          </div>

          {/* Footer */}
          <div style={{ background: T.navy, padding: "20px 24px", textAlign: "center" }}>
            <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(13), color: "rgba(255,255,255,0.4)", margin: "0 0 4px" }}>Custos · askcustos.com · A guardian for your conscience</p>
            <p style={{ fontFamily: "EB Garamond, serif", fontSize: fz(11), color: "rgba(255,255,255,0.25)", margin: 0 }}>This tool supplements — never replaces — a confessor or spiritual director.</p>
          </div>
        </div>
      )}

      {/* ═══ MAIN TABS ═══ */}
      {tab === "seek" && (
        <>
          <SeekTab goHome={() => setTab("seek")} dark={dark} setDark={setDark} fszGlobal={fszGlobal} setFszGlobal={setFszGlobal} onSettings={() => setTab("settings")} seekStartView={seekStartView} clearStartView={() => setSeekStartView(null)} />
          <BottomNav active="seek" onTab={setTab} />
        </>
      )}

      {tab === "today" && (
        <>
          <TodayTab />
          <BottomNav active="today" onTab={setTab} />
        </>
      )}

      {tab === "pray" && (
        <>
          <PrayHub onTab={setTab} />
          <BottomNav active="pray" onTab={setTab} />
        </>
      )}

      {/* ═══ SUB-FEATURES (accessed from Pray hub) ═══ */}
      {tab === "examen" && (
        <>
          <ExamenTab />
          <BottomNav active="pray" onTab={setTab} />
        </>
      )}

      {tab === "confession" && (
        <>
          <ConfessionTab />
          <BottomNav active="pray" onTab={setTab} />
        </>
      )}

      {tab === "stations" && (
        <>
          <StationsTab goHome={() => setTab("pray")} />
          <BottomNav active="pray" onTab={setTab} />
        </>
      )}

      {tab === "rosary" && (
        <>
          <RosaryTab goHome={() => setTab("pray")} dark={dark} setDark={setDark} fszGlobal={fszGlobal} setFszGlobal={setFszGlobal} />
          <BottomNav active="pray" onTab={setTab} />
        </>
      )}

      {tab === "tradition" && (
        <>
          <TraditionTab />
          <BottomNav active="tradition" onTab={setTab} />
        </>
      )}

      {/* ═══ SUB-FEATURES (accessed from More) ═══ */}
      {tab === "settings" && (
        <SettingsTab dark={dark} setDark={setDark} fszGlobal={fszGlobal} setFszGlobal={setFszGlobal}
          goHome={() => setTab("seek")} onPrivacy={() => { setSeekStartView("privacy"); setTab("seek"); }} />
      )}
    </div>
  );
}
