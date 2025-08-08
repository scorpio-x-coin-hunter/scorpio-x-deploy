const parts = message.trim().split(/\s+/);
  const cmd = parts[0].toLowerCase();

  // Payment command: payment [serviceKeyword] [payerName] [amount]
  if (cmd === "payment") {
    if (parts.length < 4) {
      return res.json({
        reply: "Usage: payment [service keyword] [your full name] [amount]",
      });
    }

    const serviceKeyword = parts[1];
    const payerName = parts.slice(2, parts.length - 1).join(" ");
    const amountStr = parts[parts.length - 1];
    const amount = parseFloat(amountStr);

    if (isNaN(amount) || amount <= 0) {
      return res.json({ reply: "⚠️ Invalid amount. Please enter a valid number." });
    }

    const service = findServiceByKeyword(serviceKeyword);
    if (!service) {
      return res.json({ reply: `⚠️ Service keyword "${serviceKeyword}" not found.` });
    }

    // Generate payment instructions and log
    const { paymentReference, paymentInfo } = generatePaymentInstructions(
      service.name,
      payerName,
      amount
    );

    return res.json({
      reply: `🪙 Payment instructions for ${service.name}:\n\n${paymentInfo}\n\nYour payment reference is: ${paymentReference}`,
    });
  }

  // Confirm payment command: confirm payment [paymentReference]
  if (cmd === "confirm") {
    if (parts.length < 3) {
      return res.json({
        reply: "Usage: confirm payment [payment reference code]",
      });
    }
    const subCmd = parts[1].toLowerCase();
    if (subCmd !== "payment") {
      return res.json({ reply: "Unknown confirm command. Use 'confirm payment [ref]'." });
    }
    const paymentRef = parts.slice(2).join("");
    // Read vault log and find the payment
    const log = readVaultLog();
    const found = log.find((entry) => entry.paymentLink === paymentRef);
    if (!found) {
      return res.json({ reply: `❌ Payment reference ${paymentRef} not found.` });
    }
    // Mark payment as confirmed
    found.confirmed = true;

    // Save updated vault log back to file for persistence
    fs.writeFileSync(
      path.join(__dirname, "vault_log.json"),
      JSON.stringify(log, null, 2)
    );

    return res.json({
      reply: `✅ Payment reference ${paymentRef} confirmed. Thank you!`,
    });
  }

  // Unknown command fallback
  return res.json({
    reply: "⚠️ Unknown command. Use 'payment' or 'confirm payment'.",
  });
});

module.exports = router;