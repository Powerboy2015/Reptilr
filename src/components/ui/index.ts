import ButtonWrapper from "./ButtonWrapper.tsx";
import Header from "./Header.tsx";
import TextInput from "./TextInput.tsx";

export const UI = {
    input: {
        text: TextInput,
    },
    header: Header,
    // button: ButtonWrapper,
} as const;
