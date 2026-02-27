const prisma = require("../lib/prisma");
const logger = require("../logger");

module.exports.createOrder = async (req, res, next) => {
  const { restaurantId } = req.params;
  const { fullName, phone, email, items } = req.body;

  try {
    const productIds = [...new Set(items.map((i) => i.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, restaurantId },
    });

    if (products.length !== productIds.length) {
      return res.status(404).json({ error: "One or more products not found" });
    }

    const allOptionChoiceIds = [
      ...new Set(items.flatMap((i) => i.optionChoiceIds || [])),
    ];
    let optionChoices = [];
    if (allOptionChoiceIds.length > 0) {
      optionChoices = await prisma.optionChoice.findMany({
        where: { id: { in: allOptionChoiceIds } },
      });
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    const optionChoiceMap = new Map(optionChoices.map((oc) => [oc.id, oc]));

    let totalPrice = 0;
    for (const item of items) {
      const product = productMap.get(item.productId);
      const basePrice = parseFloat(product.price);
      const optionsPrice = (item.optionChoiceIds || []).reduce((sum, ocId) => {
        const oc = optionChoiceMap.get(ocId);
        return sum + (oc ? parseFloat(oc.priceModifier) : 0);
      }, 0);
      totalPrice += (basePrice + optionsPrice) * item.quantity;
    }

    const data = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: { restaurantId, fullName, phone, email, totalPrice },
      });

      for (const item of items) {
        const orderProduct = await tx.orderProduct.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
          },
        });

        if (item.optionChoiceIds && item.optionChoiceIds.length > 0) {
          await tx.orderProductOption.createMany({
            data: item.optionChoiceIds.map((ocId) => ({
              orderProductId: orderProduct.id,
              optionChoiceId: ocId,
            })),
          });
        }
      }

      return tx.order.findUnique({
        where: { id: order.id },
        include: {
          orderProducts: {
            include: {
              product: true,
              orderProductOptions: { include: { optionChoice: true } },
            },
          },
        },
      });
    });

    logger.info({ orderId: data.id, restaurantId }, "Order created");
    return res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
};

module.exports.getOrders = async (req, res, next) => {
  const { restaurantId } = req.params;

  try {
    const data = await prisma.order.findMany({
      where: { restaurantId },
      orderBy: { createdAt: "desc" },
      include: {
        orderProducts: {
          include: {
            product: true,
            orderProductOptions: { include: { optionChoice: true } },
          },
        },
      },
    });

    logger.info({ restaurantId }, "Orders retrieved");
    return res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

module.exports.getOrder = async (req, res, next) => {
  const { orderId } = req.params;

  try {
    const data = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderProducts: {
          include: {
            product: true,
            orderProductOptions: { include: { optionChoice: true } },
          },
        },
      },
    });

    if (!data) {
      return res.status(404).json({ error: "Order not found" });
    }

    logger.info({ orderId }, "Order retrieved");
    return res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

module.exports.updateOrderStatus = async (req, res, next) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    const data = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    logger.info({ orderId, status }, "Order status updated");
    return res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};
