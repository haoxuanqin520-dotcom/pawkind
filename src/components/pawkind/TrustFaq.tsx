import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";

import dogEating from "@/assets/dog-eating.jpg";

type Check = { label: string; state: "done" | "in-progress" | "planned" | "not-started" };

const CHECKS: Check[] = [
  { label: "Research with dog owners in Singapore", state: "done" },
  { label: "Recipe built to FEDIAF adult targets", state: "in-progress" },
  { label: "Lab analysis of protein, fat, fibre and moisture", state: "not-started" },
  { label: "Feeding trial for taste and digestion", state: "planned" },
  { label: "Microbiological safety testing", state: "planned" },
];

const STATE_LABEL: Record<Check["state"], string> = {
  done: "Done",
  "in-progress": "In progress",
  planned: "Planned",
  "not-started": "Not started",
};

const CHAIN = ["Food by-products", "Black Soldier Fly larvae", "Protein meal", "PawKind kibble"];

export function TrustFaq() {
  return (
    <section id="faq" className="faq-section" aria-labelledby="faq-title">
      <div className="wrap faq-layout">
        <div className="faq-main">
          <h2 id="faq-title">Questions owners ask us.</h2>
          <AccordionPrimitive.Root
            type="single"
            collapsible
            defaultValue="why"
            className="faq-list"
          >
            <Item value="why" question="Why insect protein?">
              <p>
                Black Soldier Fly larvae turn food by-products into a dense, complete protein, and
                raising them takes far less land and water than raising livestock.
              </p>
              <ol className="faq-chain" aria-label="How the protein is made">
                {CHAIN.map((step) => (
                  <li key={step}>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <p>
                For your dog, what matters is that the protein is digestible and the recipe is
                complete. That's what we're testing now. The lighter footprint is a bonus, not the
                reason to switch.
              </p>
            </Item>

            <Item value="age" question="Is it right for my dog's age?">
              <p>
                PawKind is an adult recipe for healthy dogs from about 1 to 7 years old. Puppies,
                and pregnant or nursing dogs, need recipes made for those stages. For dogs over 7 or
                with a health condition, check with your vet first.
              </p>
              <p>
                <a href="#passport">The dog passport</a> runs this check for you.
              </p>
            </Item>

            <Item value="made" question="How are the ingredients made?">
              <p>
                The larvae are raised on pre-consumer food by-products, such as fruit and vegetable
                trimmings from food processing, never plate waste. They're harvested, heat-treated,
                dried and milled into protein meal, which is then cooked with the other ingredients
                into kibble.
              </p>
              <p>This is the planned process. No production batch has been made yet.</p>
            </Item>

            <Item value="tested" question="What has been tested so far?">
              <ul className="check-list">
                {CHECKS.map((check) => (
                  <li key={check.label}>
                    <span>{check.label}</span>
                    <b className={`state state-${check.state}`}>{STATE_LABEL[check.state]}</b>
                  </li>
                ))}
              </ul>
              <p>
                We'll update this list as results come in. Anything not marked done is not a claim
                we make.
              </p>
            </Item>

            <Item value="trace" question="How will I know where my bag came from?">
              <p>
                Each bag is planned to carry a trace code on its side panel. Scanning it would show
                the insect supplier's lot, the production batch and the lab results for that batch.
                This isn't live yet.
              </p>
            </Item>

            <Item value="apply" question="What happens when I apply for the trial?">
              <p>
                You give your name, email and a few details about your dog. No payment is taken. If
                PawKind launched, we would email you to confirm before charging S$9.90 and sending
                the 300 g pack.
              </p>
              <p>
                PawKind is an NUS student concept, so for now applications are not sent or stored
                anywhere.
              </p>
            </Item>
          </AccordionPrimitive.Root>
        </div>

        <figure className="faq-photo">
          <img
            src={dogEating}
            alt="A West Highland terrier eating kibble from a ceramic bowl in a bright kitchen."
            width={1264}
            height={848}
            loading="lazy"
          />
        </figure>
      </div>
    </section>
  );
}

function Item({
  value,
  question,
  children,
}: {
  value: string;
  question: string;
  children: ReactNode;
}) {
  return (
    <AccordionPrimitive.Item value={value} className="faq-item">
      <AccordionPrimitive.Header asChild>
        <h3>
          <AccordionPrimitive.Trigger className="faq-trigger">
            {question}
            <ChevronDown aria-hidden="true" />
          </AccordionPrimitive.Trigger>
        </h3>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content className="faq-content data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div>{children}</div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
}
