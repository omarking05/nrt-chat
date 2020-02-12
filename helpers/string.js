function unifyWhatsappPhoneNumber(whatsAppString) {
    return whatsAppString.replace('whatsapp:', '');
}

module.exports = {
    unifyWhatsappPhoneNumber: unifyWhatsappPhoneNumber
};
