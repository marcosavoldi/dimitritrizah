export type Language = 'it' | 'en';

export interface Translation {
    heroDate: string;
    scrollDown: string;
    introText: string;
    confirmBy: string;
    importantTitle: string;
    noKidsPolicy: string;
    giftTitle: string;
    giftText: string;
    ibanLabel: string;
    holderLabel: string;
    ceremonyTitle: string;
    receptionTitle: string;
    ceremonyPlace: string;
    receptionPlace: string;
    mapsButton: string;
    follow: string;
    rsvpTitle: string;
    rsvpSuccessTitle: string;
    rsvpSuccessText: string;
    rsvpAnother: string;
    name: string;
    surname: string;
    intolerances: string;
    notes: string;
    submit: string;
    submitting: string;
    error: string;
    contactsTitle: string;
    contactsText: string;
    whereWhen: string;
    // Merged Section
    mergedTitle: string;
    mergedTime: string;
    mergedLocation: string;
    // Allergy Modal
    allergiesQuestion: string;
    yes: string;
    no: string;
    modalTitle: string;
    intolerancesTitle: string;
    allergiesTitle: string;
    confirm: string;
    // Intolerances
    lactose: string;
    gluten: string;
    sulfites: string;
    histamine: string;
    treeNuts: string;
    peanuts: string;
    eggs: string;
    fish: string;
    shellfish: string;
    other: string;
    specify: string;
    // New Family RSVP
    adults: string;
    children05: string;
    children610: string;
    mainGuestName: string;
    guestName: string;
    guest: string;
    guestsHeader: string;
    removeGuest: string;
    addGuest: string;
    totalGuests: string;
    dietaryNeeds: string;
    dietaryNeedsButton: string;
    dietaryNeedsButtonActive: string;
    validationErrorNames: string;
    validationErrorMainName: string;
}

export const translations: Record<Language, Translation> = {
    it: {
        heroDate: '18 Aprile 2026',
        scrollDown: '',
        introText: 'In vista del nostro matrimonio, abbiamo creato questo sito per accompagnarvi passo dopo passo verso il grande giorno.',
        confirmBy: 'Per aiutarci a organizzare tutto al meglio, vi chiediamo di confermare la vostra presenza entro il 15 marzo 2026 tramite il form in fondo alla pagina.',
        importantTitle: 'Informazione Importante ⚠️',
        noKidsPolicy: 'I vostri bambini sono per noi importantissimi, ma per questa giornata non sarà prevista animazione dedicata ai più piccoli. Se possibile, vi invitiamo ad affidarli a nonni, babysitter o amici, per potervi rilassare e vivere la festa senza pensieri… brindando insieme a noi!',
        giftTitle: 'Regalo 🎁',
        giftText: 'Mentre i nostri cuori sono già colmi d’amore.. il nostro portafoglio (che piange) spera in un piccolo rinforzo per il grande giorno e oltre!',
        ibanLabel: 'IBAN',
        holderLabel: 'INTESTAZIONE',
        ceremonyTitle: 'Cerimonia 💍',
        receptionTitle: 'Ricevimento 🥂',
        ceremonyPlace: 'Chiesa Parrocchiale di San Biagio',
        receptionPlace: 'Villa i Tramonti, Saludecio',
        mapsButton: 'Vedi su Maps 📍',
        follow: 'A seguire',
        rsvpTitle: 'Conferma Presenza ✨',
        rsvpSuccessTitle: 'Grazie per aver confermato! ❤️',
        rsvpSuccessText: 'Non vediamo l\'ora di festeggiare con te.',
        rsvpAnother: 'Invia un\'altra risposta',
        name: 'Nome',
        surname: 'Cognome',
        intolerances: 'Intolleranze o Allergie',
        notes: 'Altre segnalazioni o messaggi',
        submit: 'Conferma',
        submitting: 'Invio in corso...',
        error: 'Si è verificato un errore. Riprova.',
        contactsTitle: 'Contatti 📞',
        contactsText: 'Per qualsiasi dubbio o informazione:',
        whereWhen: 'Dove & Quando 📍',
        // Merged Section
        mergedTitle: 'Cerimonia & Ricevimento 💍🥂',
        mergedTime: 'dalle 13:00',
        mergedLocation: 'Diani Reef Beach Resort',
        // Allergy Modal
        allergiesQuestion: 'Hai intolleranze o allergie?',
        yes: 'Sì',
        no: 'No',
        modalTitle: 'Seleziona le tue esigenze',
        intolerancesTitle: 'Intolleranze',
        allergiesTitle: 'Allergie',
        confirm: 'Conferma',
        lactose: 'Lattosio',
        gluten: 'Glutine',
        sulfites: 'Solfiti',
        histamine: 'Istamina',
        treeNuts: 'Frutta a guscio',
        peanuts: 'Arachidi',
        eggs: 'Uova',
        fish: 'Pesce',
        shellfish: 'Crostacei',
        other: 'Altro (specificare)',
        specify: 'Specificare...',
        // New Family RSVP
        adults: 'Adulti',
        children05: 'Bambini (0-5 anni)',
        children610: 'Bambini (6-10 anni)',
        mainGuestName: 'Nome e Cognome (Referente)',
        guestName: 'Nome e Cognome',
        guest: 'Ospite',
        guestsHeader: 'Ospiti',
        removeGuest: 'Rimuovi',
        addGuest: 'Aggiungi Ospite',
        totalGuests: 'Totale Ospiti',
        dietaryNeeds: 'Ha intolleranze o allergie?',
        dietaryNeedsButton: 'Segnala Allergie/Intolleranze',
        dietaryNeedsButtonActive: 'Allergie Segnalate',
        validationErrorNames: 'Per favore, inserisci i nomi di tutti gli ospiti.',
        validationErrorMainName: 'Per favore, inserisci il nome del referente.',
    },
    en: {
        heroDate: 'April 18, 2026',
        scrollDown: '',
        introText: 'In anticipation of our wedding, we created this site to guide you towards the big day.',
        confirmBy: 'To help us organize everything better, please confirm your attendance by March 15, 2026 using the form at the bottom of the page.',
        importantTitle: 'Important Information ⚠️',
        noKidsPolicy: 'Your children are very important to us, but for this day there will be no entertainment dedicated to the little ones. If possible, we invite you to leave them with grandparents, babysitters or friends, so you can relax and enjoy the party without worries... toasting with us!',
        giftTitle: 'Gift 🎁',
        giftText: 'While our hearts are already full of love... our wallet (which is crying) hopes for a little reinforcement for the big day and beyond!',
        ibanLabel: 'IBAN',
        holderLabel: 'HOLDER',
        ceremonyTitle: 'Ceremony 💍',
        receptionTitle: 'Reception 🥂',
        ceremonyPlace: 'Parish Church of San Biagio',
        receptionPlace: 'Villa i Tramonti, Saludecio',
        mapsButton: 'View on Maps 📍',
        follow: 'To follow',
        rsvpTitle: 'Confirm Attendance ✨',
        rsvpSuccessTitle: 'Thank you for confirming! ❤️',
        rsvpSuccessText: 'We can\'t wait to celebrate with you.',
        rsvpAnother: 'Send another response',
        name: 'Name',
        surname: 'Surname',
        intolerances: 'Intolerances or Allergies',
        notes: 'Other notes or messages',
        submit: 'Confirm',
        submitting: 'Sending...',
        error: 'An error occurred. Please try again.',
        contactsTitle: 'Contacts 📞',
        contactsText: 'For any doubts or information:',
        whereWhen: 'Where & When 📍',
        // Merged Section
        mergedTitle: 'Ceremony & Reception 💍🥂',
        mergedTime: 'from 1:00 PM',
        mergedLocation: 'Diani Reef Beach Resort',
        // Allergy Modal
        allergiesQuestion: 'Do you have intolerances or allergies?',
        yes: 'Yes',
        no: 'No',
        modalTitle: 'Select your needs',
        intolerancesTitle: 'Intolerances',
        allergiesTitle: 'Allergies',
        confirm: 'Confirm',
        lactose: 'Lactose',
        gluten: 'Gluten',
        sulfites: 'Sulfites',
        histamine: 'Histamine',
        treeNuts: 'Tree Nuts',
        peanuts: 'Peanuts',
        eggs: 'Eggs',
        fish: 'Fish',
        shellfish: 'Shellfish',
        other: 'Other (specify)',
        specify: 'Specify...',
        // New Family RSVP
        adults: 'Adults',
        children05: 'Children (0-5 years)',
        children610: 'Children (6-10 years)',
        mainGuestName: 'Name and Surname (Main Contact)',
        guestName: 'Name and Surname',
        guest: 'Guest',
        guestsHeader: 'Guests',
        removeGuest: 'Remove',
        addGuest: 'Add Guest',
        totalGuests: 'Total Guests',
        dietaryNeeds: 'Do you have dietary needs?',
        dietaryNeedsButton: 'Report Allergies/Intolerances',
        dietaryNeedsButtonActive: 'Allergies Reported',
        validationErrorNames: 'Please enter names for all guests.',
        validationErrorMainName: 'Please enter the main contact name.',
    }
};
