// import ButtonWrapper from "./ButtonWrapper.tsx";
import Header from "./Header.tsx";
import ReptilNavigator from "./ReptileNavigator.tsx";
import TextInput from "./TextInput.tsx";

export const UI = {
    input: {
        text: TextInput,
    },
    header: Header,
    nav: {
        reptile: ReptilNavigator
    }
    // button: ButtonWrapper,
} as const;
