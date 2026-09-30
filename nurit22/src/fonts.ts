import { loadFont as loadSuez } from "@remotion/google-fonts/SuezOne";
import { loadFont as loadHeebo } from "@remotion/google-fonts/Heebo";

loadSuez("normal", { subsets: ["hebrew", "latin"] });
loadHeebo("normal", { weights: ["300", "400", "500", "700"], subsets: ["hebrew", "latin"] });
