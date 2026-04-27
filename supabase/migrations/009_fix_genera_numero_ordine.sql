-- Migration 009: Fix genera_numero_ordine
-- Il prefisso degli ordini era erroneamente preso da prefisso_preventivo (usato per i preventivi).
-- Gli ordini usano sempre il prefisso fisso 'ORD', indipendentemente dalla configurazione.

CREATE OR REPLACE FUNCTION genera_numero_ordine()
RETURNS VARCHAR AS $$
DECLARE
    v_anno_corrente INT;
    v_ultimo_numero INT;
    v_prefisso      VARCHAR(20) := 'ORD';   -- Prefisso FISSO per gli ordini
    v_nuovo_numero  VARCHAR(50);
BEGIN
    -- Legge l'anno dalla tabella impostazioni (fallback: anno corrente di sistema)
    SELECT COALESCE(anno_corrente, EXTRACT(YEAR FROM CURRENT_DATE)::INT)
    INTO   v_anno_corrente
    FROM   impostazioni
    LIMIT  1;

    -- Fallback di sicurezza se impostazioni è vuota
    IF v_anno_corrente IS NULL THEN
        v_anno_corrente := EXTRACT(YEAR FROM CURRENT_DATE)::INT;
    END IF;

    -- Trova il numero progressivo più alto tra gli ordini esistenti per quest'anno
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM '[0-9]+$') AS INT)), 0)
    INTO   v_ultimo_numero
    FROM   orders
    WHERE  order_number LIKE v_prefisso || '-' || v_anno_corrente::TEXT || '-%';

    -- Compone il numero nel formato ORD-YYYY-NNNN
    v_nuovo_numero := v_prefisso
                   || '-' || v_anno_corrente::TEXT
                   || '-' || LPAD((v_ultimo_numero + 1)::TEXT, 4, '0');

    RETURN v_nuovo_numero;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION genera_numero_ordine IS
    'Genera numero progressivo ordine nel formato ORD-YYYY-NNNN (es. ORD-2026-0001). '
    'Il prefisso è fisso su ORD per distinguere gli ordini dai preventivi.';
