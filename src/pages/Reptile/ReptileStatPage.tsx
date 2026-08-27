import { useDetailedReptileContext } from "../../context/SelectedReptileContext"
import { TimeDifference } from "../../helpers/date";
import { FeedingEntry } from "../../types";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';

export default function ReptileStatPage() {
    const reptile = useDetailedReptileContext();


    if (!reptile) return <h1>Loading....</h1>

    return <div className="w-full min-h-full relative">
        <p className="text-xl text-white font-bold text-center select-none">Recent meals of {reptile.name}</p>
        <section id="feeding-list" className="divide-y-2 divide-white/20 select-none">
            {reptile.feedings.map((entry) => <FoodEntry feedingEntry={entry} />)}
            {reptile.feedings.map((entry) => <FoodEntry feedingEntry={entry} />)}
            {reptile.feedings.map((entry) => <FoodEntry feedingEntry={entry} />)}
            {reptile.feedings.map((entry) => <FoodEntry feedingEntry={entry} />)}
            {reptile.feedings.map((entry) => <FoodEntry feedingEntry={entry} />)}

        </section>

        {/* Span is used to more easily get a bottom row and just have a button in the middle of the full row. */}
        <span className="absolute bottom-0 w-full flex items-center justify-center">
            <button className="bg-[#FF9F9F] hover:bg-[#FF9F9F]/90 py-2 px-[20%] rounded">
                Add another meal
            </button>
        </span>
    </div>
}


interface feedingEntryProps {
    feedingEntry: FeedingEntry
}
const FoodEntry = ({ feedingEntry }: feedingEntryProps) => {
    const today = new Date();
    const fedDate = new Date(feedingEntry.date);

    const timeDifference = TimeDifference(today, fedDate);
    const daysAgo = Math.floor(timeDifference.hours / 24);
    const hoursLeft = Math.floor(timeDifference.hours % 24);


    return <div className="w-full px-4 py-2 text-white flex flex-row">
        <div className="flex flex-col w-full">
            <div className="flex flex-row items-center space-x-2">
                <h2 className="text-xl font-bold">{feedingEntry.date}</h2>
                <p className="text-white/80">({daysAgo}d {hoursLeft}h ago)</p>
            </div>
            <p><strong>Meal:</strong> {feedingEntry.amount} {feedingEntry.foodType}</p>
            <p><strong>Powdered?</strong> {feedingEntry.powdered ? "yes," : "no"} {feedingEntry.powderType && feedingEntry.powdered ? feedingEntry.powderType : ""} </p>
        </div>
        <span className="w-1/4 flex items-center justify-end space-x-1">
            <div className="p-1 hover:bg-white/20 rounded">
                <EditOutlinedIcon sx={{ fontSize: 36, color: "#FF9F9F" }} />
            </div>
            <div className="p-1 hover:bg-white/20 rounded">
                <DeleteOutlinedIcon sx={{ fontSize: 36 }} className=" text-[#FF9F9F] hover:text-red-500" />
            </div>
        </span>
    </div>
}