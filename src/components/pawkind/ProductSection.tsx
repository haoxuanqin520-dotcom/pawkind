import { useState } from "react";

import packBack from "@/assets/pack-back.webp";
import packFront from "@/assets/pack-front.webp";
import packSide from "@/assets/pack-side.webp";

const GALLERY = [
  {
    src: packFront,
    width: 627,
    height: 963,
    label: "Front",
    alt: "Front of the PawKind bag: a cream and caramel pouch with a West Highland terrier beside a bowl of kibble.",
  },
  {
    src: packBack,
    width: 468,
    height: 762,
    label: "Back",
    alt: "Back of the bag showing the chain from food by-products to Black Soldier Fly, protein and pet food, plus storage notes.",
  },
  {
    src: packSide,
    width: 202,
    height: 766,
    label: "Side",
    alt: "Side panel reading Meet. Plan. Trace. above a space for the bag's trace code.",
  },
];

const [FIRST_IMAGE] = GALLERY as [(typeof GALLERY)[number], ...typeof GALLERY];

const SIZES = [
  {
    weight: "300 g",
    name: "Trial pack",
    price: "S$9.90",
    note: "Apply now. No payment today.",
    available: true,
  },
  {
    weight: "1.5 kg",
    name: "Standard bag",
    price: "S$34.90",
    note: "After your trial",
    available: false,
  },
  {
    weight: "5 kg",
    name: "Family bag",
    price: "S$99.90",
    note: "After your trial",
    available: false,
  },
];

const SWITCH_STEPS = [
  { days: "Days 1–2", share: 25 },
  { days: "Days 3–4", share: 50 },
  { days: "Days 5–6", share: 75 },
  { days: "Day 7", share: 100 },
];

export function ProductSection({ onApply }: { onApply: () => void }) {
  const [active, setActive] = useState(0);
  const image = GALLERY[active] ?? FIRST_IMAGE;

  return (
    <section id="food" className="product-section" aria-labelledby="product-title">
      <div className="wrap">
        <div className="product-layout">
          <div className="product-gallery">
            <figure className="product-stage">
              <img
                key={image.src}
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
              />
            </figure>
            <div className="product-thumbs" role="group" aria-label="Bag views">
              {GALLERY.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  aria-pressed={active === index}
                  onClick={() => setActive(index)}
                >
                  <img
                    src={item.src}
                    alt=""
                    width={item.width}
                    height={item.height}
                    loading="lazy"
                  />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="product-panel">
            <h2 id="product-title">PawKind adult dog food</h2>
            <p className="product-sub">
              A complete dry food concept for healthy adult dogs, made with Black Soldier Fly
              protein. Recipe and packaging are still in development.
            </p>
            <ul className="product-tags" aria-label="At a glance">
              <li>For adult dogs</li>
              <li>Insect protein</li>
              <li>7-day switch plan</li>
            </ul>

            <fieldset className="size-picker">
              <legend>Size</legend>
              {SIZES.map((size) => (
                <label
                  key={size.weight}
                  className={`size-option${size.available ? "" : " is-later"}`}
                >
                  <input
                    type="radio"
                    name="size"
                    value={size.weight}
                    defaultChecked={size.available}
                    disabled={!size.available}
                  />
                  <span className="size-weight">{size.weight}</span>
                  <span className="size-name">
                    {size.name}
                    <small>{size.note}</small>
                  </span>
                  <span className="size-price">{size.price}</span>
                </label>
              ))}
            </fieldset>

            <button type="button" className="btn btn-primary btn-wide" onClick={onApply}>
              Apply for the trial
            </button>
            <p className="product-fine">
              Applying is free. If PawKind launched, we would email you to confirm before charging
              S$9.90 for the 300 g pack. The packaging shown is a 1 kg concept; the trial pack would
              use the same design.
            </p>
          </div>
        </div>

        <div className="switch-guide">
          <div className="switch-guide-copy">
            <h3>The 7-day switch</h3>
            <p>
              Mix PawKind into your dog's current food, a little more every two days. A gentle
              switch is kinder on the stomach.
            </p>
          </div>
          <ol className="switch-steps">
            {SWITCH_STEPS.map((step) => (
              <li key={step.days}>
                <Bowl share={step.share} />
                <strong>{step.days}</strong>
                <span>{step.share}% PawKind</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

// A bowl whose kibble is split between PawKind (caramel) and the current food (oat).
function Bowl({ share }: { share: number }) {
  const clipId = `bowl-${share}`;
  return (
    <svg className="bowl" viewBox="0 4 120 62" aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <ellipse cx="60" cy="33" rx="47" ry="23" />
        </clipPath>
      </defs>
      <path d="M8 30 Q 60 16 112 30" className="bowl-rim" />
      <g clipPath={`url(#${clipId})`}>
        <rect x="0" y="0" width="120" height="48" className="bowl-old" />
        <rect x="12" y="0" width={96 * (share / 100)} height="48" className="bowl-new" />
      </g>
      <path d="M8 30 Q 60 44 112 30 C 108 62, 12 62, 8 30 Z" className="bowl-body" />
    </svg>
  );
}
