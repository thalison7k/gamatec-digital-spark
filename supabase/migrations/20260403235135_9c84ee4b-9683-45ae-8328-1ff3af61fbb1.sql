ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS url text;

UPDATE public.projects 
SET url = 'https://thalisonportifolio.netlify.app/' 
WHERE client_id = '107058a8-193a-4e2f-b524-7509fec839d9' 
AND title = 'Portfólio Thalison Silva';