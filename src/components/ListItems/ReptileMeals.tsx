import { FeedingEntry } from "../../types"

interface ReptileMealsProps {
    recentMeals: FeedingEntry[]
}

export default function ReptileMeals({ recentMeals }: ReptileMealsProps) {
    return <section id="Recent-reptile-meals" className="flex flex-col">
        <h2>Recent feedings</h2>
        {recentMeals.map((entry) => foodEntry(entry))}
    </section>
}


function foodEntry(meal: FeedingEntry) {
    return <div>
        <p>Date: {meal.date}</p>
        <p>Food: {meal.foodType}</p>
        <p>powdered? {meal.powdered ? meal.powderType : "no"}</p>
        <p>Amount: {meal.amount}</p>
    </div>
}
