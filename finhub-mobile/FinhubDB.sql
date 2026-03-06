--
-- PostgreSQL database dump
--

\restrict aqyCd7tBqWGHZqRxfnS2jMWwV63WpuznzGc2kRMsIObfNaLeOMbZEiNHTE3twfD

-- Dumped from database version 15.14
-- Dumped by pg_dump version 15.14

-- Started on 2026-03-06 02:00:33

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 46673)
-- Name: AccountPermissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AccountPermissions" (
    "PermissionId" uuid NOT NULL,
    "WalletId" uuid NOT NULL,
    "GranteeUserId" uuid NOT NULL,
    "AccessLevel" text NOT NULL,
    "MaxAmountPerTransaction" numeric(19,4),
    "RequireRequestForOverLimit" boolean NOT NULL,
    "DailySpendLimit" numeric(19,4)
);


ALTER TABLE public."AccountPermissions" OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 46690)
-- Name: Budgets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Budgets" (
    "BudgetId" uuid NOT NULL,
    "GroupId" uuid NOT NULL,
    "CategoryId" uuid,
    "WalletId" uuid,
    "AmountLimit" numeric(19,4) NOT NULL,
    "BudgetType" text NOT NULL,
    "StartDate" timestamp with time zone NOT NULL,
    "EndDate" timestamp with time zone NOT NULL,
    "IsRolling" boolean NOT NULL,
    CONSTRAINT "CHK_Budget_Scope" CHECK ((("CategoryId" IS NOT NULL) OR ("WalletId" IS NOT NULL)))
);


ALTER TABLE public."Budgets" OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 46616)
-- Name: Categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Categories" (
    "CategoryId" uuid NOT NULL,
    "GroupId" uuid,
    "ParentId" uuid,
    "Name" character varying(100) NOT NULL,
    "Type" text NOT NULL,
    "Icon" text
);


ALTER TABLE public."Categories" OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 46633)
-- Name: Goals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Goals" (
    "GoalId" uuid NOT NULL,
    "GroupId" uuid NOT NULL,
    "Name" character varying(100) NOT NULL,
    "TargetAmount" numeric(19,4) NOT NULL,
    "CurrentAmount" numeric(19,4) NOT NULL,
    "Deadline" timestamp with time zone,
    "Status" character varying(20) NOT NULL
);


ALTER TABLE public."Goals" OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 46643)
-- Name: GroupMembers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."GroupMembers" (
    "MemberId" uuid NOT NULL,
    "GroupId" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "Role" character varying(50) NOT NULL,
    "JoinedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."GroupMembers" OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 46587)
-- Name: Groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Groups" (
    "GroupId" uuid NOT NULL,
    "Name" character varying(100) NOT NULL,
    "Type" text NOT NULL,
    "OwnerId" uuid NOT NULL,
    "ThemeColor" character varying(20),
    "CreatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Groups" OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 46599)
-- Name: Notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Notifications" (
    "NotificationId" uuid NOT NULL,
    "RecipientUserId" uuid NOT NULL,
    "SenderUserId" uuid,
    "RelatedEntityId" uuid,
    "EntityType" character varying(50) NOT NULL,
    "Title" character varying(255) NOT NULL,
    "Message" text NOT NULL,
    "Status" character varying(20) NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Notifications" OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 46713)
-- Name: RecurringTransactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RecurringTransactions" (
    "RecurringId" uuid NOT NULL,
    "WalletId" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "CategoryId" uuid NOT NULL,
    "Amount" numeric(19,4) NOT NULL,
    "Frequency" text NOT NULL,
    "StartDate" timestamp with time zone NOT NULL,
    "NextRunDate" timestamp with time zone NOT NULL,
    "EndDate" timestamp with time zone
);


ALTER TABLE public."RecurringTransactions" OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 46735)
-- Name: Transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Transactions" (
    "TransactionId" uuid NOT NULL,
    "WalletId" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "CategoryId" uuid,
    "Amount" numeric(19,4) NOT NULL,
    "Type" text NOT NULL,
    "TransactionDate" timestamp with time zone NOT NULL,
    "Note" character varying(500),
    "EvidenceUrl" text,
    "Status" text DEFAULT 'Pending'::text NOT NULL,
    "ApprovedBy" uuid,
    "ApprovedAt" timestamp with time zone,
    "RelatedTransactionId" uuid,
    "CreatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Transactions" OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 46580)
-- Name: Users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Users" (
    "UserId" uuid NOT NULL,
    "Email" character varying(255) NOT NULL,
    "PasswordHash" text,
    "FullName" character varying(100) NOT NULL,
    "AvatarUrl" text,
    "CreatedAt" timestamp with time zone NOT NULL,
    "IsActive" boolean NOT NULL,
    "Nickname" character varying(50)
);


ALTER TABLE public."Users" OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 46783)
-- Name: WalletBalanceHistories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WalletBalanceHistories" (
    "HistoryId" uuid NOT NULL,
    "WalletId" uuid NOT NULL,
    "TransactionId" uuid NOT NULL,
    "PreviousBalance" numeric(19,4) NOT NULL,
    "NewBalance" numeric(19,4) NOT NULL,
    "ChangeAmount" numeric(19,4) NOT NULL,
    "ChangedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."WalletBalanceHistories" OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 46768)
-- Name: WalletMember; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WalletMember" (
    "WalletMemberId" uuid NOT NULL,
    "WalletId" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "AccessLevel" integer NOT NULL
);


ALTER TABLE public."WalletMember" OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 46658)
-- Name: Wallets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Wallets" (
    "WalletId" uuid NOT NULL,
    "GroupId" uuid,
    "OwnerUserId" uuid,
    "Name" character varying(100) NOT NULL,
    "Type" character varying(50) NOT NULL,
    "Currency" character varying(10) NOT NULL,
    "InitialBalance" numeric(19,4) NOT NULL,
    "CurrentBalance" numeric(19,4) NOT NULL,
    "IsArchived" boolean NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "IsDefaultAccount" boolean DEFAULT false NOT NULL,
    "AlertThresholdPercentage" integer
);


ALTER TABLE public."Wallets" OWNER TO postgres;

--
-- TOC entry 214 (class 1259 OID 46575)
-- Name: __EFMigrationsHistory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL
);


ALTER TABLE public."__EFMigrationsHistory" OWNER TO postgres;

--
-- TOC entry 3459 (class 0 OID 46673)
-- Dependencies: 222
-- Data for Name: AccountPermissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AccountPermissions" ("PermissionId", "WalletId", "GranteeUserId", "AccessLevel", "MaxAmountPerTransaction", "RequireRequestForOverLimit", "DailySpendLimit") FROM stdin;
\.


--
-- TOC entry 3460 (class 0 OID 46690)
-- Dependencies: 223
-- Data for Name: Budgets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Budgets" ("BudgetId", "GroupId", "CategoryId", "WalletId", "AmountLimit", "BudgetType", "StartDate", "EndDate", "IsRolling") FROM stdin;
\.


--
-- TOC entry 3455 (class 0 OID 46616)
-- Dependencies: 218
-- Data for Name: Categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Categories" ("CategoryId", "GroupId", "ParentId", "Name", "Type", "Icon") FROM stdin;
\.


--
-- TOC entry 3456 (class 0 OID 46633)
-- Dependencies: 219
-- Data for Name: Goals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Goals" ("GoalId", "GroupId", "Name", "TargetAmount", "CurrentAmount", "Deadline", "Status") FROM stdin;
\.


--
-- TOC entry 3457 (class 0 OID 46643)
-- Dependencies: 220
-- Data for Name: GroupMembers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."GroupMembers" ("MemberId", "GroupId", "UserId", "Role", "JoinedAt") FROM stdin;
\.


--
-- TOC entry 3453 (class 0 OID 46587)
-- Dependencies: 216
-- Data for Name: Groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Groups" ("GroupId", "Name", "Type", "OwnerId", "ThemeColor", "CreatedAt") FROM stdin;
\.


--
-- TOC entry 3454 (class 0 OID 46599)
-- Dependencies: 217
-- Data for Name: Notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Notifications" ("NotificationId", "RecipientUserId", "SenderUserId", "RelatedEntityId", "EntityType", "Title", "Message", "Status", "CreatedAt") FROM stdin;
\.


--
-- TOC entry 3461 (class 0 OID 46713)
-- Dependencies: 224
-- Data for Name: RecurringTransactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RecurringTransactions" ("RecurringId", "WalletId", "UserId", "CategoryId", "Amount", "Frequency", "StartDate", "NextRunDate", "EndDate") FROM stdin;
\.


--
-- TOC entry 3462 (class 0 OID 46735)
-- Dependencies: 225
-- Data for Name: Transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Transactions" ("TransactionId", "WalletId", "UserId", "CategoryId", "Amount", "Type", "TransactionDate", "Note", "EvidenceUrl", "Status", "ApprovedBy", "ApprovedAt", "RelatedTransactionId", "CreatedAt") FROM stdin;
\.


--
-- TOC entry 3452 (class 0 OID 46580)
-- Dependencies: 215
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Users" ("UserId", "Email", "PasswordHash", "FullName", "AvatarUrl", "CreatedAt", "IsActive", "Nickname") FROM stdin;
\.


--
-- TOC entry 3464 (class 0 OID 46783)
-- Dependencies: 227
-- Data for Name: WalletBalanceHistories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WalletBalanceHistories" ("HistoryId", "WalletId", "TransactionId", "PreviousBalance", "NewBalance", "ChangeAmount", "ChangedAt") FROM stdin;
\.


--
-- TOC entry 3463 (class 0 OID 46768)
-- Dependencies: 226
-- Data for Name: WalletMember; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WalletMember" ("WalletMemberId", "WalletId", "UserId", "AccessLevel") FROM stdin;
\.


--
-- TOC entry 3458 (class 0 OID 46658)
-- Dependencies: 221
-- Data for Name: Wallets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Wallets" ("WalletId", "GroupId", "OwnerUserId", "Name", "Type", "Currency", "InitialBalance", "CurrentBalance", "IsArchived", "CreatedAt", "IsDefaultAccount", "AlertThresholdPercentage") FROM stdin;
\.


--
-- TOC entry 3451 (class 0 OID 46575)
-- Dependencies: 214
-- Data for Name: __EFMigrationsHistory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."__EFMigrationsHistory" ("MigrationId", "ProductVersion") FROM stdin;
20251216141029_FirstDatabase	8.0.0
\.


--
-- TOC entry 3256 (class 2606 OID 46679)
-- Name: AccountPermissions PK_AccountPermissions; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AccountPermissions"
    ADD CONSTRAINT "PK_AccountPermissions" PRIMARY KEY ("PermissionId");


--
-- TOC entry 3261 (class 2606 OID 46697)
-- Name: Budgets PK_Budgets; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Budgets"
    ADD CONSTRAINT "PK_Budgets" PRIMARY KEY ("BudgetId");


--
-- TOC entry 3241 (class 2606 OID 46622)
-- Name: Categories PK_Categories; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Categories"
    ADD CONSTRAINT "PK_Categories" PRIMARY KEY ("CategoryId");


--
-- TOC entry 3244 (class 2606 OID 46637)
-- Name: Goals PK_Goals; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Goals"
    ADD CONSTRAINT "PK_Goals" PRIMARY KEY ("GoalId");


--
-- TOC entry 3248 (class 2606 OID 46647)
-- Name: GroupMembers PK_GroupMembers; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GroupMembers"
    ADD CONSTRAINT "PK_GroupMembers" PRIMARY KEY ("MemberId");


--
-- TOC entry 3233 (class 2606 OID 46593)
-- Name: Groups PK_Groups; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Groups"
    ADD CONSTRAINT "PK_Groups" PRIMARY KEY ("GroupId");


--
-- TOC entry 3237 (class 2606 OID 46605)
-- Name: Notifications PK_Notifications; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notifications"
    ADD CONSTRAINT "PK_Notifications" PRIMARY KEY ("NotificationId");


--
-- TOC entry 3266 (class 2606 OID 46719)
-- Name: RecurringTransactions PK_RecurringTransactions; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RecurringTransactions"
    ADD CONSTRAINT "PK_RecurringTransactions" PRIMARY KEY ("RecurringId");


--
-- TOC entry 3273 (class 2606 OID 46742)
-- Name: Transactions PK_Transactions; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "PK_Transactions" PRIMARY KEY ("TransactionId");


--
-- TOC entry 3230 (class 2606 OID 46586)
-- Name: Users PK_Users; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "PK_Users" PRIMARY KEY ("UserId");


--
-- TOC entry 3281 (class 2606 OID 46787)
-- Name: WalletBalanceHistories PK_WalletBalanceHistories; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WalletBalanceHistories"
    ADD CONSTRAINT "PK_WalletBalanceHistories" PRIMARY KEY ("HistoryId");


--
-- TOC entry 3277 (class 2606 OID 46772)
-- Name: WalletMember PK_WalletMember; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WalletMember"
    ADD CONSTRAINT "PK_WalletMember" PRIMARY KEY ("WalletMemberId");


--
-- TOC entry 3252 (class 2606 OID 46662)
-- Name: Wallets PK_Wallets; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Wallets"
    ADD CONSTRAINT "PK_Wallets" PRIMARY KEY ("WalletId");


--
-- TOC entry 3228 (class 2606 OID 46579)
-- Name: __EFMigrationsHistory PK___EFMigrationsHistory; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."__EFMigrationsHistory"
    ADD CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId");


--
-- TOC entry 3253 (class 1259 OID 46798)
-- Name: IX_AccountPermissions_GranteeUserId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_AccountPermissions_GranteeUserId" ON public."AccountPermissions" USING btree ("GranteeUserId");


--
-- TOC entry 3254 (class 1259 OID 46799)
-- Name: IX_AccountPermissions_WalletId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_AccountPermissions_WalletId" ON public."AccountPermissions" USING btree ("WalletId");


--
-- TOC entry 3257 (class 1259 OID 46800)
-- Name: IX_Budgets_CategoryId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Budgets_CategoryId" ON public."Budgets" USING btree ("CategoryId");


--
-- TOC entry 3258 (class 1259 OID 46801)
-- Name: IX_Budgets_GroupId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Budgets_GroupId" ON public."Budgets" USING btree ("GroupId");


--
-- TOC entry 3259 (class 1259 OID 46802)
-- Name: IX_Budgets_WalletId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Budgets_WalletId" ON public."Budgets" USING btree ("WalletId");


--
-- TOC entry 3238 (class 1259 OID 46803)
-- Name: IX_Categories_GroupId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Categories_GroupId" ON public."Categories" USING btree ("GroupId");


--
-- TOC entry 3239 (class 1259 OID 46804)
-- Name: IX_Categories_ParentId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Categories_ParentId" ON public."Categories" USING btree ("ParentId");


--
-- TOC entry 3242 (class 1259 OID 46805)
-- Name: IX_Goals_GroupId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Goals_GroupId" ON public."Goals" USING btree ("GroupId");


--
-- TOC entry 3245 (class 1259 OID 46806)
-- Name: IX_GroupMembers_GroupId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_GroupMembers_GroupId" ON public."GroupMembers" USING btree ("GroupId");


--
-- TOC entry 3246 (class 1259 OID 46807)
-- Name: IX_GroupMembers_UserId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_GroupMembers_UserId" ON public."GroupMembers" USING btree ("UserId");


--
-- TOC entry 3231 (class 1259 OID 46808)
-- Name: IX_Groups_OwnerId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Groups_OwnerId" ON public."Groups" USING btree ("OwnerId");


--
-- TOC entry 3234 (class 1259 OID 46809)
-- Name: IX_Notifications_RecipientUserId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Notifications_RecipientUserId" ON public."Notifications" USING btree ("RecipientUserId");


--
-- TOC entry 3235 (class 1259 OID 46810)
-- Name: IX_Notifications_SenderUserId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Notifications_SenderUserId" ON public."Notifications" USING btree ("SenderUserId");


--
-- TOC entry 3262 (class 1259 OID 46811)
-- Name: IX_RecurringTransactions_CategoryId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_RecurringTransactions_CategoryId" ON public."RecurringTransactions" USING btree ("CategoryId");


--
-- TOC entry 3263 (class 1259 OID 46812)
-- Name: IX_RecurringTransactions_UserId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_RecurringTransactions_UserId" ON public."RecurringTransactions" USING btree ("UserId");


--
-- TOC entry 3264 (class 1259 OID 46813)
-- Name: IX_RecurringTransactions_WalletId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_RecurringTransactions_WalletId" ON public."RecurringTransactions" USING btree ("WalletId");


--
-- TOC entry 3267 (class 1259 OID 46814)
-- Name: IX_Transactions_ApprovedBy; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Transactions_ApprovedBy" ON public."Transactions" USING btree ("ApprovedBy");


--
-- TOC entry 3268 (class 1259 OID 46815)
-- Name: IX_Transactions_CategoryId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Transactions_CategoryId" ON public."Transactions" USING btree ("CategoryId");


--
-- TOC entry 3269 (class 1259 OID 46816)
-- Name: IX_Transactions_RelatedTransactionId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Transactions_RelatedTransactionId" ON public."Transactions" USING btree ("RelatedTransactionId");


--
-- TOC entry 3270 (class 1259 OID 46817)
-- Name: IX_Transactions_UserId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Transactions_UserId" ON public."Transactions" USING btree ("UserId");


--
-- TOC entry 3271 (class 1259 OID 46818)
-- Name: IX_Transactions_WalletId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Transactions_WalletId" ON public."Transactions" USING btree ("WalletId");


--
-- TOC entry 3278 (class 1259 OID 46819)
-- Name: IX_WalletBalanceHistories_TransactionId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_WalletBalanceHistories_TransactionId" ON public."WalletBalanceHistories" USING btree ("TransactionId");


--
-- TOC entry 3279 (class 1259 OID 46820)
-- Name: IX_WalletBalanceHistories_WalletId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_WalletBalanceHistories_WalletId" ON public."WalletBalanceHistories" USING btree ("WalletId");


--
-- TOC entry 3274 (class 1259 OID 46821)
-- Name: IX_WalletMember_UserId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_WalletMember_UserId" ON public."WalletMember" USING btree ("UserId");


--
-- TOC entry 3275 (class 1259 OID 46822)
-- Name: IX_WalletMember_WalletId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_WalletMember_WalletId" ON public."WalletMember" USING btree ("WalletId");


--
-- TOC entry 3249 (class 1259 OID 46823)
-- Name: IX_Wallets_GroupId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Wallets_GroupId" ON public."Wallets" USING btree ("GroupId");


--
-- TOC entry 3250 (class 1259 OID 46824)
-- Name: IX_Wallets_OwnerUserId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Wallets_OwnerUserId" ON public."Wallets" USING btree ("OwnerUserId");


--
-- TOC entry 3292 (class 2606 OID 46680)
-- Name: AccountPermissions FK_AccountPermissions_Users_GranteeUserId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AccountPermissions"
    ADD CONSTRAINT "FK_AccountPermissions_Users_GranteeUserId" FOREIGN KEY ("GranteeUserId") REFERENCES public."Users"("UserId") ON DELETE CASCADE;


--
-- TOC entry 3293 (class 2606 OID 46685)
-- Name: AccountPermissions FK_AccountPermissions_Wallets_WalletId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AccountPermissions"
    ADD CONSTRAINT "FK_AccountPermissions_Wallets_WalletId" FOREIGN KEY ("WalletId") REFERENCES public."Wallets"("WalletId") ON DELETE CASCADE;


--
-- TOC entry 3294 (class 2606 OID 46698)
-- Name: Budgets FK_Budgets_Categories_CategoryId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Budgets"
    ADD CONSTRAINT "FK_Budgets_Categories_CategoryId" FOREIGN KEY ("CategoryId") REFERENCES public."Categories"("CategoryId");


--
-- TOC entry 3295 (class 2606 OID 46703)
-- Name: Budgets FK_Budgets_Groups_GroupId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Budgets"
    ADD CONSTRAINT "FK_Budgets_Groups_GroupId" FOREIGN KEY ("GroupId") REFERENCES public."Groups"("GroupId") ON DELETE CASCADE;


--
-- TOC entry 3296 (class 2606 OID 46708)
-- Name: Budgets FK_Budgets_Wallets_WalletId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Budgets"
    ADD CONSTRAINT "FK_Budgets_Wallets_WalletId" FOREIGN KEY ("WalletId") REFERENCES public."Wallets"("WalletId");


--
-- TOC entry 3285 (class 2606 OID 46623)
-- Name: Categories FK_Categories_Categories_ParentId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Categories"
    ADD CONSTRAINT "FK_Categories_Categories_ParentId" FOREIGN KEY ("ParentId") REFERENCES public."Categories"("CategoryId") ON DELETE RESTRICT;


--
-- TOC entry 3286 (class 2606 OID 46628)
-- Name: Categories FK_Categories_Groups_GroupId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Categories"
    ADD CONSTRAINT "FK_Categories_Groups_GroupId" FOREIGN KEY ("GroupId") REFERENCES public."Groups"("GroupId");


--
-- TOC entry 3287 (class 2606 OID 46638)
-- Name: Goals FK_Goals_Groups_GroupId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Goals"
    ADD CONSTRAINT "FK_Goals_Groups_GroupId" FOREIGN KEY ("GroupId") REFERENCES public."Groups"("GroupId") ON DELETE CASCADE;


--
-- TOC entry 3288 (class 2606 OID 46648)
-- Name: GroupMembers FK_GroupMembers_Groups_GroupId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GroupMembers"
    ADD CONSTRAINT "FK_GroupMembers_Groups_GroupId" FOREIGN KEY ("GroupId") REFERENCES public."Groups"("GroupId") ON DELETE CASCADE;


--
-- TOC entry 3289 (class 2606 OID 46653)
-- Name: GroupMembers FK_GroupMembers_Users_UserId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GroupMembers"
    ADD CONSTRAINT "FK_GroupMembers_Users_UserId" FOREIGN KEY ("UserId") REFERENCES public."Users"("UserId") ON DELETE CASCADE;


--
-- TOC entry 3282 (class 2606 OID 46594)
-- Name: Groups FK_Groups_Users_OwnerId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Groups"
    ADD CONSTRAINT "FK_Groups_Users_OwnerId" FOREIGN KEY ("OwnerId") REFERENCES public."Users"("UserId") ON DELETE CASCADE;


--
-- TOC entry 3283 (class 2606 OID 46606)
-- Name: Notifications FK_Notifications_Users_RecipientUserId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notifications"
    ADD CONSTRAINT "FK_Notifications_Users_RecipientUserId" FOREIGN KEY ("RecipientUserId") REFERENCES public."Users"("UserId") ON DELETE CASCADE;


--
-- TOC entry 3284 (class 2606 OID 46611)
-- Name: Notifications FK_Notifications_Users_SenderUserId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notifications"
    ADD CONSTRAINT "FK_Notifications_Users_SenderUserId" FOREIGN KEY ("SenderUserId") REFERENCES public."Users"("UserId") ON DELETE RESTRICT;


--
-- TOC entry 3297 (class 2606 OID 46720)
-- Name: RecurringTransactions FK_RecurringTransactions_Categories_CategoryId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RecurringTransactions"
    ADD CONSTRAINT "FK_RecurringTransactions_Categories_CategoryId" FOREIGN KEY ("CategoryId") REFERENCES public."Categories"("CategoryId") ON DELETE CASCADE;


--
-- TOC entry 3298 (class 2606 OID 46725)
-- Name: RecurringTransactions FK_RecurringTransactions_Users_UserId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RecurringTransactions"
    ADD CONSTRAINT "FK_RecurringTransactions_Users_UserId" FOREIGN KEY ("UserId") REFERENCES public."Users"("UserId") ON DELETE CASCADE;


--
-- TOC entry 3299 (class 2606 OID 46730)
-- Name: RecurringTransactions FK_RecurringTransactions_Wallets_WalletId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RecurringTransactions"
    ADD CONSTRAINT "FK_RecurringTransactions_Wallets_WalletId" FOREIGN KEY ("WalletId") REFERENCES public."Wallets"("WalletId") ON DELETE CASCADE;


--
-- TOC entry 3300 (class 2606 OID 46743)
-- Name: Transactions FK_Transactions_Categories_CategoryId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "FK_Transactions_Categories_CategoryId" FOREIGN KEY ("CategoryId") REFERENCES public."Categories"("CategoryId");


--
-- TOC entry 3301 (class 2606 OID 46748)
-- Name: Transactions FK_Transactions_Transactions_RelatedTransactionId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "FK_Transactions_Transactions_RelatedTransactionId" FOREIGN KEY ("RelatedTransactionId") REFERENCES public."Transactions"("TransactionId") ON DELETE RESTRICT;


--
-- TOC entry 3302 (class 2606 OID 46753)
-- Name: Transactions FK_Transactions_Users_ApprovedBy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "FK_Transactions_Users_ApprovedBy" FOREIGN KEY ("ApprovedBy") REFERENCES public."Users"("UserId") ON DELETE RESTRICT;


--
-- TOC entry 3303 (class 2606 OID 46758)
-- Name: Transactions FK_Transactions_Users_UserId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "FK_Transactions_Users_UserId" FOREIGN KEY ("UserId") REFERENCES public."Users"("UserId") ON DELETE CASCADE;


--
-- TOC entry 3304 (class 2606 OID 46763)
-- Name: Transactions FK_Transactions_Wallets_WalletId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "FK_Transactions_Wallets_WalletId" FOREIGN KEY ("WalletId") REFERENCES public."Wallets"("WalletId") ON DELETE CASCADE;


--
-- TOC entry 3307 (class 2606 OID 46788)
-- Name: WalletBalanceHistories FK_WalletBalanceHistories_Transactions_TransactionId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WalletBalanceHistories"
    ADD CONSTRAINT "FK_WalletBalanceHistories_Transactions_TransactionId" FOREIGN KEY ("TransactionId") REFERENCES public."Transactions"("TransactionId") ON DELETE CASCADE;


--
-- TOC entry 3308 (class 2606 OID 46793)
-- Name: WalletBalanceHistories FK_WalletBalanceHistories_Wallets_WalletId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WalletBalanceHistories"
    ADD CONSTRAINT "FK_WalletBalanceHistories_Wallets_WalletId" FOREIGN KEY ("WalletId") REFERENCES public."Wallets"("WalletId") ON DELETE CASCADE;


--
-- TOC entry 3305 (class 2606 OID 46773)
-- Name: WalletMember FK_WalletMember_Users_UserId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WalletMember"
    ADD CONSTRAINT "FK_WalletMember_Users_UserId" FOREIGN KEY ("UserId") REFERENCES public."Users"("UserId") ON DELETE CASCADE;


--
-- TOC entry 3306 (class 2606 OID 46778)
-- Name: WalletMember FK_WalletMember_Wallets_WalletId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WalletMember"
    ADD CONSTRAINT "FK_WalletMember_Wallets_WalletId" FOREIGN KEY ("WalletId") REFERENCES public."Wallets"("WalletId") ON DELETE CASCADE;


--
-- TOC entry 3290 (class 2606 OID 46663)
-- Name: Wallets FK_Wallets_Groups_GroupId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Wallets"
    ADD CONSTRAINT "FK_Wallets_Groups_GroupId" FOREIGN KEY ("GroupId") REFERENCES public."Groups"("GroupId") ON DELETE CASCADE;


--
-- TOC entry 3291 (class 2606 OID 46668)
-- Name: Wallets FK_Wallets_Users_OwnerUserId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Wallets"
    ADD CONSTRAINT "FK_Wallets_Users_OwnerUserId" FOREIGN KEY ("OwnerUserId") REFERENCES public."Users"("UserId") ON DELETE RESTRICT;


-- Completed on 2026-03-06 02:00:33

--
-- PostgreSQL database dump complete
--

\unrestrict aqyCd7tBqWGHZqRxfnS2jMWwV63WpuznzGc2kRMsIObfNaLeOMbZEiNHTE3twfD

