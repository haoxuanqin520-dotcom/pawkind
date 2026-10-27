import { CheckCircle2, PawPrint } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";

import westiePortrait from "@/assets/westie-portrait.jpg";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { buildPlan, findBreed, possessive, type DogProfile } from "./passport";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: DogProfile;
  onEditPassport: () => void;
};

export function TrialDialog({ open, onOpenChange, profile, onEditPassport }: Props) {
  const plan = useMemo(() => buildPlan(profile), [profile]);
  const breed = findBreed(profile.breed);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const dogName = profile.name.trim() || "Your dog";
  const blocked = plan.status === "not-suitable";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get("email");
    setSentTo(typeof email === "string" ? email : "");
  }

  const details = [
    breed?.label,
    plan.kg !== null ? `${plan.kg} kg` : null,
    plan.lifeStage?.toLowerCase(),
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="trial-dialog">
        <ol className="journey" aria-label="Trial steps">
          <li className="done">Your dog</li>
          <li className="done">Their plan</li>
          <li aria-current="step">Apply</li>
        </ol>

        {sentTo !== null ? (
          <div className="trial-done" role="status">
            <CheckCircle2 aria-hidden="true" />
            <DialogTitle>You've applied for {possessive(dogName)} trial</DialogTitle>
            <DialogDescription>
              In a real launch, we'd email {sentTo || "you"} to confirm before taking any payment.
              This is a student concept site, so your details were not sent or stored.
            </DialogDescription>
            <button type="button" className="btn btn-primary" onClick={() => onOpenChange(false)}>
              Done
            </button>
          </div>
        ) : (
          <>
            <div>
              <DialogTitle className="trial-title">Apply for the 300 g trial</DialogTitle>
              <DialogDescription className="trial-sub">
                S$9.90, charged only after we confirm your pack. Applying is free.
              </DialogDescription>
            </div>

            <div className={`trial-dog trial-dog-${plan.status}`}>
              <span className="trial-dog-photo">
                {breed?.value === "westie" ? (
                  <img src={westiePortrait} alt="" width={380} height={380} />
                ) : (
                  <PawPrint aria-hidden="true" />
                )}
              </span>
              <span className="trial-dog-text">
                <strong>For {dogName}</strong>
                <span>{details || "Details not set"}</span>
              </span>
              <button type="button" className="text-link" onClick={onEditPassport}>
                Edit
              </button>
            </div>

            {plan.status === "vet" && (
              <p className="trial-flag">Please check with your vet before starting the switch.</p>
            )}
            {plan.status === "incomplete" && (
              <p className="trial-flag">
                Add {profile.name.trim() ? possessive(dogName) : "your dog's"} age and weight in the
                passport so we can check the trial suits them.
              </p>
            )}
            {blocked && (
              <p className="trial-flag trial-flag-stop">
                The trial is for healthy adult dogs, so we can't take this application. If a detail
                is wrong, edit the passport.
              </p>
            )}

            <form className="trial-form" onSubmit={submit}>
              <label className="field">
                <span>Your name</span>
                <input name="name" required maxLength={80} autoComplete="name" disabled={blocked} />
              </label>
              <label className="field">
                <span>Email</span>
                <input
                  name="email"
                  type="email"
                  required
                  maxLength={150}
                  autoComplete="email"
                  disabled={blocked}
                />
              </label>
              <label className="check">
                <input type="checkbox" required disabled={blocked} />
                <span>
                  I understand PawKind is a student concept. No payment is taken and nothing is sent
                  yet.
                </span>
              </label>
              <button type="submit" className="btn btn-primary btn-wide" disabled={blocked}>
                Apply for the trial
              </button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
