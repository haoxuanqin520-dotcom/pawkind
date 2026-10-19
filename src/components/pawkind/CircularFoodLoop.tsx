import { Apple, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Factory, Soup, Wheat } from "lucide-react";

export function CircularFoodLoop() {
  return <div className="food-loop" role="img" aria-label="Circular food loop: fruit and vegetable by-products to insect farm to protein meal to kibble bowl">
    <div className="loop-stop loop-scraps"><Apple /><span>Food by-products</span><small>Fruit & vegetable scraps</small></div>
    <ArrowRight className="loop-arrow loop-arrow-top" />
    <div className="loop-stop loop-farm"><Factory /><span>Insect farm</span><small>Black Soldier Fly</small></div>
    <ArrowDown className="loop-arrow loop-arrow-right" />
    <div className="loop-stop loop-meal"><Wheat /><span>Protein meal</span><small>Dried & milled</small></div>
    <ArrowLeft className="loop-arrow loop-arrow-bottom" />
    <div className="loop-stop loop-bowl"><Soup /><span>Kibble bowl</span><small>Useful nutrition</small></div>
    <ArrowUp className="loop-arrow loop-arrow-left" />
    <span className="loop-center">A circular<br />approach</span>
  </div>;
}