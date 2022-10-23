
import { make_callable } from "./utils";

// Copyright © 2001-2022 Python Software Foundation; All Rights Reserved

///////////////////////////////////////////////////////////////////////////////
// There are more efficient implementations, too much work
export const deque = make_callable(class deque extends Array {})
