import { User } from "@supabase/supabase-js";

export interface Header {
    id: string;
    key: string;
    value: string;
    enabled: boolean;
}

export interface RequestData {
    method: string;
    url: string;
    headers: Header[];
    body: string;
}

export interface ResponseData {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
    time: number;
}

export interface RestClientWrapperProps {
    user: User;
}
