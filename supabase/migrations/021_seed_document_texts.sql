-- Seed default document texts for order PDF generation
-- Variables supported: {{nome_azienda}}, {{nome_cliente}}, {{codice_fiscale}},
--   {{indirizzo_cliente}}, {{numero_preventivo}}, {{modalita_pagamento}},
--   {{tipo_detrazione}}, {{importo_lavori}}

UPDATE impostazioni SET

  testo_informativa_privacy = $privacy$<p>Ai sensi del Regolamento UE 2016/679 (GDPR) e del D.Lgs. 196/2003 e successive modifiche, <strong>{{nome_azienda}}</strong>, in qualità di Titolare del Trattamento, La informa che i Suoi dati personali saranno trattati per le seguenti finalità:</p>
<ul>
<li>Esecuzione del contratto di fornitura e posa in opera dei serramenti e infissi;</li>
<li>Adempimenti fiscali, contabili e previdenziali connessi al contratto;</li>
<li>Gestione delle pratiche per le detrazioni fiscali (Ecobonus, Bonus Casa, Scheda ENEA), ove applicabile;</li>
<li>Comunicazioni operative inerenti ai lavori oggetto del contratto.</li>
</ul>
<p>I dati trattati sono quelli da Lei forniti (nome, indirizzo, codice fiscale, contatti) e sono necessari per l'esecuzione del contratto. Il conferimento è obbligatorio per le finalità contrattuali e fiscali; il rifiuto rende impossibile la prestazione del servizio.</p>
<p>I dati potranno essere comunicati a soggetti terzi coinvolti nell'esecuzione dei lavori (installatori, fornitori, professionisti), nonché agli enti previdenziali e all'Agenzia delle Entrate, nel rispetto della normativa vigente. Non è previsto alcun trasferimento di dati al di fuori dell'Unione Europea.</p>
<p>I dati saranno conservati per il periodo necessario all'esecuzione del contratto e per l'adempimento degli obblighi di legge (non inferiore a 10 anni ai fini fiscali e contabili).</p>
<p>Lei ha diritto di accedere ai Suoi dati, richiederne la rettifica, la cancellazione o la limitazione del trattamento, opporsi al trattamento e richiedere la portabilità dei dati. Ha inoltre diritto di proporre reclamo all'Autorità Garante per la protezione dei dati personali (www.garanteprivacy.it). Per esercitare tali diritti può contattare <strong>{{nome_azienda}}</strong>.$privacy$,

  testo_condizioni_pagamento_doc = $cond$<p>Le parti concordano le seguenti condizioni di pagamento per la fornitura e posa in opera oggetto del preventivo N° <strong>{{numero_preventivo}}</strong>, stipulate tra <strong>{{nome_azienda}}</strong> (fornitore) e il cliente <strong>{{nome_cliente}}</strong>.</p>
<p><strong>Modalità di pagamento concordata: {{modalita_pagamento}}</strong></p>
<p>Ai sensi della normativa fiscale vigente in materia di detrazioni fiscali (Ecobonus, Bonus Casa), tutti i pagamenti devono essere effettuati tramite bonifico bancario o postale con causale specifica riportante: la normativa di riferimento, il codice fiscale del beneficiario della detrazione e il numero di partita IVA o codice fiscale del fornitore. Il pagamento con metodi non tracciabili comporta la perdita del diritto alla detrazione fiscale.</p>
<p>In caso di ritardo nei pagamenti rispetto alle scadenze pattuite, saranno applicati interessi di mora nella misura prevista dal D.Lgs. 231/2002. I beni e le opere fornite rimangono di proprietà di <strong>{{nome_azienda}}</strong> sino al completo pagamento del corrispettivo pattuito.</p>
<p>Eventuali contestazioni relative alla fornitura devono essere comunicate per iscritto entro 8 (otto) giorni dalla consegna o ultimazione dei lavori. Qualsiasi modifica alle presenti condizioni deve essere concordata per iscritto tra le parti.$cond$,

  testo_iva_agevolata_doc = $iva$<p>Il/La sottoscritto/a <strong>{{nome_cliente}}</strong>, C.F. <strong>{{codice_fiscale}}</strong>, residente/con sede in <strong>{{indirizzo_cliente}}</strong>,</p>
<p>in qualità di committente dei lavori di fornitura e posa in opera serramenti e infissi di cui al preventivo N° <strong>{{numero_preventivo}}</strong> emesso da <strong>{{nome_azienda}}</strong>,</p>
<p><strong>DICHIARA</strong></p>
<ul>
<li>che i lavori oggetto del suddetto preventivo vengono eseguiti su immobile a destinazione residenziale privata di Sua proprietà (o su cui vanta altro diritto reale di godimento);</li>
<li>che l'immobile non rientra nelle categorie catastali A/1 (abitazioni di tipo signorile), A/8 (ville) o A/9 (castelli e palazzi di eminente pregio artistico o storico);</li>
<li>che i lavori rientrano nella categoria della manutenzione ordinaria, straordinaria o ristrutturazione edilizia ai sensi dell'art. 3, comma 1, lett. a), b) e d) del D.P.R. 380/2001;</li>
<li>che i beni di "valore significativo" forniti e installati (serramenti, infissi) soddisfano i requisiti per l'applicazione dell'aliquota IVA agevolata del 10% prevista dal D.P.R. n. 633/1972, Tabella A, Parte III, n. 127-undecies.</li>
</ul>
<p>Il/La sottoscritto/a è consapevole che la presente dichiarazione ha valore ai fini dell'applicazione dell'aliquota IVA agevolata e che, in caso di dichiarazione non veritiera, sarà tenuto/a al pagamento della differenza d'imposta tra l'aliquota ordinaria (22%) e quella agevolata (10%), oltre alle sanzioni previste dalla legge.$iva$,

  testo_atto_notorio = $atto$<p>Il/La sottoscritto/a <strong>{{nome_cliente}}</strong>, C.F. <strong>{{codice_fiscale}}</strong>,</p>
<p>consapevole delle conseguenze civili e penali derivanti da dichiarazioni false o mendaci, previste dagli artt. 75 e 76 del D.P.R. 28 dicembre 2000, n. 445,</p>
<p><strong>DICHIARA SOTTO LA PROPRIA RESPONSABILITÀ</strong></p>
<ul>
<li>di essere proprietario/a o comunque avente titolo (usufrutto, comodato, ecc.) sull'immobile oggetto dei lavori indicato nel riquadro sottostante;</li>
<li>che i lavori di fornitura e posa in opera serramenti e infissi di cui al preventivo N° <strong>{{numero_preventivo}}</strong>, emesso da <strong>{{nome_azienda}}</strong>, vengono eseguiti sull'immobile di seguito specificato;</li>
<li>che per i suddetti lavori intende usufruire della seguente agevolazione fiscale: <strong>{{tipo_detrazione}}</strong>;</li>
<li>che l'immobile oggetto dei lavori è regolarmente censito al Catasto e non è classificato nelle categorie catastali A/1, A/8 o A/9;</li>
<li>che il pagamento dei corrispettivi sarà effettuato tramite bonifico bancario o postale con causale specifica, come richiesto dalla normativa sulle detrazioni fiscali;</li>
<li>che i lavori riguardano interventi eseguiti su unità abitative a destinazione residenziale e relative pertinenze.</li>
</ul>
<p>La presente dichiarazione è resa ai sensi e per gli effetti dell'art. 47 del D.P.R. 28 dicembre 2000, n. 445. Il/La dichiarante è consapevole delle sanzioni penali previste dall'art. 76 del medesimo decreto per le ipotesi di falsità in atti e dichiarazioni mendaci.$atto$,

  testo_scheda_enea = $enea$<p><strong>COMUNICAZIONE ALL'ENEA — SCHEDA INFORMATIVA INTERVENTO</strong></p>
<p>Ai sensi della L. 296/2006 e successive modifiche, la presente scheda raccoglie i dati necessari per la comunicazione obbligatoria all'ENEA, da effettuarsi tramite il portale <strong>bonusfiscali.enea.it</strong> entro 90 giorni dalla data di fine lavori o collaudo. La mancata trasmissione comporta la perdita del diritto alla detrazione fiscale.</p>
<p><strong>Committente dei lavori:</strong> {{nome_cliente}} — C.F. {{codice_fiscale}}</p>
<p><strong>Indirizzo dell'immobile oggetto dell'intervento:</strong> {{indirizzo_cliente}}</p>
<p><strong>Tipologia di intervento:</strong> Sostituzione di serramenti e infissi con miglioramento delle prestazioni energetiche dell'involucro edilizio</p>
<p><strong>Tipo di agevolazione fiscale richiesta:</strong> {{tipo_detrazione}}</p>
<p><strong>Riferimento preventivo:</strong> N° {{numero_preventivo}} — {{nome_azienda}}</p>
<p><strong>Importo lavori (imponibile IVA):</strong> {{importo_lavori}}</p>
<p>Il committente è tenuto a trasmettere la scheda informativa all'ENEA allegando la documentazione tecnica relativa ai serramenti installati (schede tecniche, valore di trasmittanza termica U prima e dopo i lavori, superficie totale sostituita in m²). Si ricorda che la detrazione spetta esclusivamente per spese pagate tramite bonifico bancario o postale con causale appropriata.$enea$;
