export default function LocationSection() {
  return (
    <section className="bg-[#0D0808] py-12 md:py-16 border-t border-[#B8860B]/10">
      <div className="mx-auto max-w-7xl px-6 md:px-12 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="h-px w-8 bg-[#B8860B]" />
            <span className="text-[#B8860B] text-xs tracking-[0.25em] uppercase">Visit Us</span>
          </div>
          <h2 className="font-display text-2xl md:text-4xl text-white italic mb-4">
            A Saree Shop in Puttur, Karnataka
          </h2>
          <p className="text-white/60 text-sm leading-relaxed mb-4">
            Looking for a saree shop near you in Puttur? Thamanvi Silks is a saree shop on Bypass
            Road, Bappalige, stocking authentic Kanjivaram, Banarasi, and Mysore Silk sarees for
            weddings, festivals, and everyday wear. Walk in to feel the fabric, see the zari work
            up close, and get help from our team, or shop the same collection online with
            free shipping across India.
          </p>
          <p className="text-white/40 text-sm leading-relaxed mb-2">
            Ground Floor, Bappalige Tower, Bypass Road, Bappalige, Mani,<br />
            Puttur, Karnataka 574201
          </p>
          <a
            href="https://wa.me/919535779597"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 text-sm text-[#B8860B] underline underline-offset-2"
          >
            Get directions on WhatsApp →
          </a>
        </div>
        <div className="aspect-video w-full rounded overflow-hidden border border-[#B8860B]/20">
          <iframe
            title="Thamanvi Silks location on Google Maps"
            src="https://www.google.com/maps?q=Thamanvi+Silks,+Bappalige,+Mani,+Puttur&ll=12.7622995,75.1959182&z=17&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
